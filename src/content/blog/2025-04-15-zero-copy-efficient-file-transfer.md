---
title: 零拷贝实现高效文件传输
description: 零拷贝提升文件传输效率
publishDate: 2025-04-15 15:32
tags:
- java
heroImage:
  { src: 'http://wallpaper.csun.site/?zero', inferSize: true }
---

## 传统文件传输

传统 I/O 的工作方式是：

* 数据的读取是在用户态发起 `read()` 系统调用，从内核空间将数据拷贝到用户空间，而内核空间的数据是通过操作系统层面的 I/O 接口从磁盘中读取；
* 数据的写入是在用户态发起 `write()` 系统调用，从用户空间将数据拷贝到内核空间，再通过操作系统层面的 I/O 接口写入到磁盘。

如果我们想要用传统的 I/O 方式来实现服务端的文件传输，我们需要先将磁盘上的文件读取出来，然后写入到网卡，由网卡通过网络协议将文件发给客户端。

一般会涉及到两个系统调用：

```
read(file, tmp_buf, len)
write(socket, tmp_buf, len)
```

首先，期间共发生了 **4次内核态与用户态的上下文切换**，因为涉及到两个系统调用，每次发起系统调用时，都会从用户态切换到内核态，系统调用结束后又会切换回用户态，频繁的上下文切换会带来极大的开销。

![img](https://5a352de.webp.li/2025/04/75246d88dd573d95a199f6d9a3041a99.png)

其次，整个过程涉及到  **4次数据拷贝**：

* 首先，从磁盘中读取文件时，DMA 会将数据**从磁盘文件拷贝到内核缓冲区**
* 然后，CPU 会将数据**从内核缓冲区拷贝到用户缓冲区**
* 发送文件时，CPU 又会将数据**从用户缓冲区拷贝到 socket 缓冲区**
* 最后，DMA 会将数据**从socket 缓冲区拷贝到网卡**，由网卡通过网络协议将文件传输到客户端

整个过程 1 份数据拷贝了 4 次，无疑消耗了大量的 CPU 资源，降低了系统性能。

## 零拷贝

要想提高文件传输的性能，就得减少 **「内核态与用户态的上下文切换次数」**和**「数据拷贝的次数」**

* 要减少「内核态与用户态的上下文切换次数」，就得减少系统调用的次数；
* 要减少「数据拷贝的次数」，在文件传输场景中，一般不会在程序中对文件进行二次加工，所以用户缓冲区其实是没有必要的。

**零拷贝技术**就可以减少 「内核态与用户态的上下文切换次数」和「数据拷贝的次数」。

零拷贝主要有两种实现方式：

- mmap + write
- sendfile

### mmap + write

前文提到，`read()` 系统调用会将数据从内核缓冲区域拷贝到用户缓冲区域，为了减少这一步的开销，可以使用 `mmap()` 系统调用代替 `read()`

```
buf = mmap(file, len)
write(socket, buf, len)
```

具体过程如下：

* 用户程序发起 `mmap()` 系统调用后，从用户态切换到内核态，DMA 将数据从磁盘文件拷贝到内核缓冲区，执行完成后切换回用户态，用户程序和操作系统**「共享」**这个缓冲区，这样就减少了从内核缓冲区到用户缓冲区的数据拷贝开销；
* 用户程序再发起 `write()` 系统调用，切换到内核态，CPU 将内核缓冲区中的数据直接拷贝到 socket  缓冲区；
* 最后，DMA 再将 socket 缓冲区的数据拷贝到网卡。

![img](https://5a352de.webp.li/2025/04/3371519343b66205c9be449b3074292a.png)

整个过程减少了一次数据拷贝，但是这还不是最理想的零拷贝。

### sendfile

在 Linux 内核版本 2.1 中，提供了一个专门发送文件的系统调用 `sendfile()`

```c
ssize_t sendfile(int out_fd, int in_fd, off_t *offset, size_t count);
```

前两个参数分别是目标端和源端的文件描述符，`offset` 是源端的起始位置偏移量，`count` 是需要发送数据的长度，返回值是实际发送数据的长度。

首先，`sendfile()` 可以代替 `read()` 和 `write()`，从而减少一次系统调用，也就减少了两次「内核态与用户态上下文转换」的开销；其次，`sendfile()` 可以直接把数据从内核缓冲区拷贝到 socket 缓冲区，无需经过用户缓冲区，可以减少一次数据拷贝。这样整个过程就只有 **2 次上下文切换和 3 次数据拷贝**。

![img](https://5a352de.webp.li/2025/04/c2209a458b4e0eb22f9574f091fee06e.png)

但是这还不是真正的零拷贝，如果网卡支持 **SG-DMA** 技术，可以进一步减少把数据从内核缓冲区拷贝到 socket 缓冲区的开销

从 `Linux 2.4` 开始，如果网卡支持 SG-DMA 技术，`sendfile()` 系统调用的过程发生了一些变化：

* 用户程序发起 `sendfile()` 系统调用后，切换到内核态，DMA 将数据从磁盘文件拷贝到内核缓冲区，然后将 **缓冲区描述符和数据长度** 发送到 socket 缓冲区
* 接下来网卡的 **SG-DMA 控制器** 就可以直接将数据从内核缓冲区拷贝到网卡，从而减少一次数据拷贝

这就零拷贝技术，整个过程没有通过 CPU 来拷贝数据，都是通过 DMA，只需要 **2 次上下文切换 和 2 次数据拷贝**！

## Java 实现 sendfile 零拷贝

Java 可以通过 `transferFrom()` 和 `transferTo()` 方法实现 sendfile 零拷贝

`transferFrom` 和 `transferTo` 是 Java NIO (`java.nio.channels`) 中 `FileChannel` 类的两个方法，用于在文件通道之间高效地转移字节。它们是实现零拷贝的核心方法，允许在通道之间直接传输数据，避免了数据在用户空间和内核空间之间的多次拷贝，进而提高了性能。

### `transferTo` 方法

`transferTo` 方法用于将数据从一个 `FileChannel` 直接写入到另一个通道。它的基本语法如下：

```java
public long transferTo(long position, long size, WritableByteChannel target) throws IOException
```

**参数：**
- `position`: 从源通道的哪个位置开始读取数据。
- `size`: 要传输的字节数。
- `target`: 目标 `WritableByteChannel`，通常是输出流或其他可写通道。

**返回值：**
- 返回实际传输的字节数。

**使用场景：**
`transferTo` 适用于将文件中的数据写入到网络套接字、输出流等写通道。它是一个简化数据传输的方式，减少了数据的拷贝次数。

### `transferFrom` 方法

`transferFrom` 方法用于将数据从一个可读的 `ReadableByteChannel` 读取到 `FileChannel` 中。它的基本语法如下：

```java
public long transferFrom(ReadableByteChannel src, long position, long size) throws IOException
```

**参数：**
- `src`: 源 `ReadableByteChannel`，通常是输入流或其他可读通道。
- `position`: 在目标通道中写入数据的起始位置。
- `size`: 要读取的字节数。

**返回值：**
- 返回实际传输的字节数。

**使用场景：**
`transferFrom` 适用于将数据从输入流或其他通道读取并写入本地文件。它同样减少了数据在用户空间和内核空间之间的拷贝。

### 文件上传

```java
@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload");
        }
        
        String fileName = file.getOriginalFilename();
        File dest = new File("/path/to/uploads/" + fileName);
        
        // 确保目录存在
        dest.getParentFile().mkdirs();
        
        // 使用零拷贝技术保存文件
        try (ReadableByteChannel srcChannel = Channels.newChannel(file.getInputStream());
             FileChannel destChannel = new FileOutputStream(dest).getChannel()) {
            // transferFrom方法实现零拷贝
            destChannel.transferFrom(srcChannel, 0, file.getSize());
        }
        
        return ResponseEntity.ok("File uploaded successfully: " + fileName);
    }
}
```

###  文件下载

```java
@RestController
@RequestMapping("/api/files")
public class FileDownloadController {

    @GetMapping("/download/{fileName}")
    public void downloadFile(@PathVariable String fileName, HttpServletResponse response) throws IOException {
        File file = new File("/path/to/files/" + fileName);
        
        if (!file.exists()) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found");
            return;
        }
        
        response.setContentType("application/octet-stream");
        response.setContentLength((int) file.length());
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
        
        // 使用零拷贝技术传输文件
        try (FileChannel fileChannel = new FileInputStream(file).getChannel()) {
            WritableByteChannel outputChannel = Channels.newChannel(response.getOutputStream());
            // transferTo方法实现零拷贝
            fileChannel.transferTo(0, fileChannel.size(), outputChannel);
        }
    }
}
```