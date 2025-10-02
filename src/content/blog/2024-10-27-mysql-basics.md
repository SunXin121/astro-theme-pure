---
title: MySQL 基础
description: MySQL基础：DDL与数据库操作
publishDate: 2024-10-27 15:32
tags:
- MySQL
heroImage:
  { src: 'http://wallpaper.csun.site/?ddl', inferSize: true }
---

## DDL

数据库定义语言，用来定义数据库对象（数据库，表，字段）

### 数据库操作

#### 查询

查询所有数据库

```mysql
show databases
```

查询当前数据库

```mysql
select database();
```

#### 创建

```mysql
create database [if not exists] 数据库名 [default charset 字符集] [collate 排序规则];
```

#### 删除

```mysql
drop database [if exists] 数据库名;
```

#### 使用

```mysql
use 数据库名;
```

### 表操作

#### 查询

查询当前数据库所有表

```mysql
show tables;
```

查询表结构

```mysql
desc 表名;
```

查询指定表的建表语句

```mysql
show create table 表名;
```

#### 创建

```mysql
CREATE TABLE 表名(
    字段1 字段1类型[COMMENT 字段1注释],
    字段2 字段2类型[COMMENT 字段2注释],
    字段3 字段3类型[COMMENT 字段3注释],
    .......,
    字段n 字段n类型[COMMENT 字段n注释 ]
)[COMMENT 表注释];
```

**注意**：最后一个字段结尾没有逗号

#### 数据类型

##### 数值类型

| 类型         | 大小    | 有符号 (SIGNED) 范围                                | 无符号 (UNSIGNED) 范围                                  | 描述                |
| ------------ | ------- | --------------------------------------------------- | ------------------------------------------------------- | ------------------- |
| TINYINT      | 1 byte  | (-128, 127)                                         | (0, 255)                                                | 小整数值            |
| SMALLINT     | 2 bytes | (-32768, 32767)                                     | (0, 65535)                                              | 大整数值            |
| MEDIUMINT    | 3 bytes | (-8388608, 8388607)                                 | (0, 16777215)                                           | 大整数值            |
| INT或INTEGER | 4 bytes | (-2147483648, 2147483647)                           | (0, 4294967295)                                         | 大整数值            |
| BIGINT       | 8 bytes | (-2^63, 2^63-1)                                     | (0, 2^64-1)                                             | 极大整数值          |
| FLOAT        | 4 bytes | (-3.402823466E+38, 3.402823466E+38)                 | 0 和 (1.175494351E-38, 3.402823466E+38)                 | 单精度浮点数值      |
| DOUBLE       | 8 bytes | (-1.7976931348623157E+308, 1.7976931348623157E+308) | 0 和 (2.2250738585072014E-308, 1.7976931348623157E+308) | 双精度浮点数值      |
| DECIMAL      |         | 依赖于 M(精度) 和 D(标度) 的值                      | 依赖于 M(精度) 和 D(标度) 的值                          | 小数值 (精确定点数) |

> `DECIMAL` 中精度指定是整个数的位数，标度指的是小数的位数

##### 字符串类型

| 类型       | 大小                  | 描述                          |
| ---------- | --------------------- | ----------------------------- |
| CHAR       | 0-255 bytes           | 定长字符串                    |
| VARCHAR    | 0-65535 bytes         | 变长字符串                    |
| TINYBLOB   | 0-255 bytes           | 不超过 255 个字符的二进制数据 |
| TINYTEXT   | 0-255 bytes           | 短文本字符串                  |
| BLOB       | 0-65 535 bytes        | 二进制形式的长文本数据        |
| TEXT       | 0-65 535 bytes        | 长文本数据                    |
| MEDIUMBLOB | 0-16 777 215 bytes    | 二进制形式的中等长度文本数据  |
| MEDIUMTEXT | 0-16 777 215 bytes    | 中等长度文本数据              |
| LONGBLOB   | 0-4 294 967 295 bytes | 二进制形式的极大文本数据      |
| LONGTEXT   | 0-4 294 967 295 bytes | 极大文本数据                  |

`char(10)` 无论存储多长的内容，都会占用 10 个字节的空间，但是性能好

`varchar(10)` 会根据实际存储的内容计算占用空间，但是性能较差

##### 日期时间类型

| 类型      | 大小 | 范围                                       | 格式                | 描述                     |
| --------- | ---- | ------------------------------------------ | ------------------- | ------------------------ |
| DATE      | 3    | 1000-01-01 至 9999-12-31                   | YYYY-MM-DD          | 日期值                   |
| TIME      | 3    | -838:59:59 至 838:59:59                    | HH:MM:SS            | 时间值或持续时间         |
| YEAR      | 1    | 1901 至 2155                               | YYYY                | 年份值                   |
| DATETIME  | 8    | 1000-01-01 00:00:00 至 9999-12-31 23:59:59 | YYYY-MM-DD HH:MM:SS | 混合日期和时间值         |
| TIMESTAMP | 4    | 1970-01-01 00:00:01 至 2038-01-19 03:14:07 | YYYY-MM-DD HH:MM:SS | 混合日期和时间值，时间戳 |

#### 修改

添加字段

```mysql
alter table 表名 add 字段名 类型(长度) [comment 注释] [约束];
```

修改数据类型

```mysql
alter table 表名 modify 字段名 新数据类型(长度);
```

修改字段名和字段类型

```mysql
alter table 表名 change 旧字段名 新字段名 类型(长度) [comment 注释] [约束];
```

删除字段

```mysql
alter table 表名 drop 字段名;
```

修改表名

```mysql
alter table 表名 rename to 新表名;
```

#### 删除

删除表

```mysql
drop table [if exists] 表名;
```

删除指定表, 并重新创建该表

```mysql
truncate table 表名;
```

## DML

数据操作语言，用来对数据库表种的数据进行增删改

### 添加数据

给指定字段添加数据

```mysql
INSERT INTO 表名 (字段名1, 字段名2, ...) VALUES (值1, 值2, ...);
```

给全部字段添加数据

```mysql
INSERT INTO 表名 VALUES (值1, 值2, ...);
```

批量添加数据

```mysql 
INSERT INTO 表名 VALUES (值1, 值2, ...), (值1, 值2, ...);
INSERT INTO 表名 (字段名1, 字段名2, ...) VALUES (值1, 值2, ...), (值1, 值2, ...);
```

**注意**：

* 插入数据时，指定的字段顺序需要与值的顺序一一对应
* 字符串和日期类型数据应该包含在引号中
* 插入的数据大小应该在字段的规定范围之内

### 修改数据

```mysql
update 表名 set 字段名1 = 值1, 字段名2 = 值2,...[where 条件];
```

### 删除数据

```mysql
delete from 表名 [where 条件];
```

## DQL

数据查询语言，用来查询数据库种表的记录

```mysql
SELECT 
	字段列表
FROM 
	表名列表
WHERE 
	条件列表
GROUP BY 
	分组字段列表
HAVING 
	分组后条件列表
ORDER BY 
	排序字段列表
LIMIT 
	分页参数
```

### 基本查询

查询多个字段
```mysql
SELECT * FROM 表名;
SELECT 字段1, 字段2, 字段3 ... FROM 表名;
```

设置别名

```mysql
SELECT 字段1 [AS 别名1], 字段2 [AS 别名2] ... FROM 表名;
```

去除重复记录

```mysql
SELECT DISTINCT 字段列表 FROM 表名;
```

### 条件查询

```mysql
select 字段列表 from 表名 where 条件列表;
```

#### 条件

| 比较运算符          | 功能                                    |
| ------------------- | --------------------------------------- |
| >                   | 大于                                    |
| >=                  | 大于等于                                |
| <                   | 小于                                    |
| <=                  | 小于等于                                |
| =                   | 等于                                    |
| <> 或 !=            | 不等于                                  |
| BETWEEN ... AND ... | 在某个范围之内 (含最小、最大值)         |
| IN(...)             | 在 in 之后的列表中的值，多选一          |
| LIKE 占位符         | 模糊匹配 (_匹配单个字符, %匹配任意字符) |
| IS NULL             | 是 NULL                                 |

| 逻辑运算符 | 功能                        |
| ---------- | --------------------------- |
| AND 或 &&  | 并且 (多个条件同时成立)     |
| OR 或 \|\| | 或者 (多个条件任意一个成立) |
| NOT 或 ！  | 非, 不是                    |

### 聚合函数

将一列数据作为一个整体，进行纵向计算

| 函数  | 功能     |
| ----- | -------- |
| count | 统计数量 |
| max   | 最大值   |
| min   | 最小值   |
| avg   | 平均值   |
| sum   | 求和     |

### 分组查询

```mysql
select 字段列表 from 表名 [where 条件] GROUP BY 分组字段名 [HAVING 分组后过滤条件];
```

**where 和 having 区别**：

* 执行时机不同: `where` 是分组之前进行过滤, 不满足 `where` 条件不参与分组，而 `having` 是分组之后对结果进行过滤
* 判断条件不同：`where` 不能对聚合函数进行判断，而 `having` 可以

### 排序

```mysql
select 字段列表 from 表名 order by 字段1 排序方式1, 字段2 排序方式2;
```

排序方式：

* `ASC`: 升序
* `DESC`: 降序

### 分页查询

```mysql
select * from 表名 limit 起始索引, 查询记录数;
```

**注意**：

* 起始索引从 0 开始，起始索引 = (查询页码 - 1) * 每页显示记录数
* 如果查询第一页数据，起始索引可以省略，直接简写为 `limit 10`

### 执行顺序

```mysql
from 表名列表 where 条件列表 group 分组字段列表 having 分组后条件列表 select 字段列表 order by 排序字段 limit 分页参数
```

## DCL

数据控制语言，用来创建数据库用户、控制数据库的访问权限

### 管理用户

查询用户

```mysql
USE mysql;
SELECT * FROM user;
```

创建用户
```mysql
CREATE USER '用户名'@'主机名' IDENTIFIED BY '密码';
```

修改用户密码
```mysql
ALTER USER '用户名'@'主机名' IDENTIFIED WITH mysql_native_password BY '新密码';
```

删除用户
```mysql
DROP USER '用户名'@'主机名';
```

### 权限控制

查询权限
```mysql
SHOW GRANTS FOR '用户名'@'主机名';
```

授予权限
```mysql
GRANT 权限列表 ON 数据库名.表名 TO '用户名'@'主机名';
```

撤销权限
```mysql
REVOKE 权限列表 ON 数据库名.表名 FROM '用户名'@'主机名';
```

## 函数

### 字符串函数

| 函数                     | 功能                                                      |
| :----------------------- | :-------------------------------------------------------- |
| CONCAT(S1,S2,...Sn)      | 字符串拼接，将S1，S2，... Sn拼接成一个字符串              |
| LOWER(str)               | 将字符串全部转为小写                                      |
| UPPER(str)               | 将字符串全部转为大写                                      |
| LPAD(str,n,pad)          | 左填充，用字符串pad对str的左边进行填充，达到n个字符串长度 |
| RPAD(str,n,pad)          | 右填充，用字符串pad对str的右边进行填充，达到n个字符串长度 |
| TRIM(str)                | 去掉字符串头部和尾部的空格                                |
| SUBSTRING(str,start,len) | 返回从字符串str从start位置起的len个长度的字符串           |

### 数值函数

| 函数       | 功能                                   |
| ---------- | -------------------------------------- |
| CEIL(x)    | 向上取整                               |
| FLOOR(x)   | 向下取整                               |
| MOD(x,y)   | 返回 x/y 的模                          |
| RAND()     | 返回 0~1 内的随机数                    |
| ROUND(x,y) | 求参数 x 的四舍五入的值，保留 y 位小数 |

### 日期函数

| 函数                               | 功能                                                |
| ---------------------------------- | --------------------------------------------------- |
| CURDATE()                          | 返回当前日期                                        |
| CURTIME()                          | 返回当前时间                                        |
| NOW()                              | 返回当前日期和时间                                  |
| YEAR(date)                         | 获取指定 date 的年份                                |
| MONTH(date)                        | 获取指定 date 的月份                                |
| DAY(date)                          | 获取指定 date 的日期                                |
| DATE_ADD(date, INTERVAL expr type) | 返回一个日期/时间值加上一个时间间隔 expr 后的时间值 |
| DATEDIFF(date1, date2)             | 返回起始时间 date1 和结束时间 date2 之间的天数      |

```mysql
select date_add(now(), INTERVAL 70 DAY);  # 当前时间往后 70 天
select date_add(now(), INTERVAL 70 MONTH);  # 当前时间往后 70 月
select date_add(now(), INTERVAL 70 YEAR);  # 当前时间往后 70 年
```

### 流程控制函数

| 函数                                                       | 功能                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| IF(value, t, f)                                            | 如果 value 为 true，则返回 t，否则返回 f                     |
| IFNULL(value1, value2)                                     | 如果 value1 不为空，返回 value1，否则返回 value2             |
| CASE WHEN [val1] THEN [res1] ... ELSE [default] END        | 如果 val1 为 true，返回 res1，... 否则返回 default 默认值    |
| CASE [expr] WHEN [val1] THEN [res1] ... ELSE [default] END | 如果 expr 的值等于 val1，返回 res1，... 否则返回 default 默认值 |

```mysql
-- 查询学生的成绩，>=85 展示优秀，>=60 展示及格，否则展示不及格
select name, (case when score >= 85 then '优秀' when score >= 60 then '及格' else '不及格' end) as grade from students;
```

## 约束

约束是作用于表中字段上的规则，用于限制存储在表中的数据，保证数据库中数据的正确性、有效性和完整性

### 约束的分类

| 约束                       | 描述                                                     | 关键字      |
| -------------------------- | -------------------------------------------------------- | ----------- |
| 非空约束                   | 限制该字段的数据不能为 null                              | NOT NULL    |
| 唯一约束                   | 保证该字段的所有数据都是唯一、不重复的                   | UNIQUE      |
| 主键约束                   | 主键是一行数据的唯一标识，要求非空且唯一                 | PRIMARY KEY |
| 默认约束                   | 保存数据时，如果未指定该字段的值，则采用默认值           | DEFAULT     |
| 检查约束 (8.0.16 版本之后) | 保证字段值满足某一个条件                                 | CHECK       |
| 外键约束                   | 用来让两张表的数据之间建立连接，保证数据的一致性和完整性 | FOREIGN KEY |

```mysql
create table user(
    id int primary key auto_increment comment '主键',  -- 主键并且自动增长
    name varchar(10) not null unique comment '姓名',  -- 非空且唯一
    age int check (age > 0 && age <= 120) comment '年龄', -- 大于 0 小于 120
    status char(1) default '1' comment '状态'  -- 默认值为 1
) comment '用户表';
```

### 外键约束

外键用来让两张表的数据之间建立连接，从而保证数据的一致性和完整性

#### 添加外键

```sql
CREATE TABLE 表名 (
    字段名 数据类型,
    ...
    [CONSTRAINT] [外键名称] FOREIGN KEY (外键字段名) REFERENCES 主表(主表列名)
);

ALTER TABLE 表名 ADD CONSTRAINT 外键名称 FOREIGN KEY (外键字段名) REFERENCES 主表(主表列名);
```

#### 删除外键

```mysql
ALTER TABLE 表名 DROP FOREIGN KEY 外键名称;
```

#### 删除/更新行为

| 行为        | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| NO ACTION   | 当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有则不允许删除/更新。（与 RESTRICT 一致） |
| RESTRICT    | 当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有则不允许删除/更新。（与 NO ACTION 一致） |
| CASCADE     | 当在父表中删除/更新对应记录时，如果有，则删除/更新外键在子表中的记录。 |
| SET NULL    | 当在父表中删除对应记录时，首先检查该记录是否有外键，如果有则设置子表中该外键值为 null（这就要求该外键允许取 null）。 |
| SET DEFAULT | 父表有变更时，子表将外键列设置成一个默认的值（InnoDB 不支持）。 |

前两种是默认行为

指定行为语法：

```mysql
ALTER TABLE 表名 ADD CONSTRAINT 外键名称 FOREIGN KEY (外键字段名) REFERENCES 主表(主表列名) ON UPDATE CASCADE ON DELETE CASCADE;
```

## 多表查询

### 多表关系

#### 一对多（多对一）

例如部门与员工的关系，一个部门对应多个员工，一个员工对应一个部门

**实现**：在多的一方建立外键，指向一的一方的主键

#### 多对多

例如学生与课程的关系，一个学生可以选修多门课程，一门课程也可以供多个学生选择

**实现**：建立第三张中间表，中间表至少包含两个外键，分别关联两方主键

#### 一对一

一对一关系多用于**单表拆分**，将一张表的基础字段放在一张表中，其他详情字段放在另一张表中，以提升操作效率

**实现**：在任意一方加入外键，关联另外一方的主键，并设置外键唯一

### 内连接

内连接查询的是两张表的**交集部分**

* 隐式内连接

```mysql
select 字段 from 表1, 表2 where 条件...;
```

* 显式内连接

```mysql
select 字段列表 from 表1 [inner] join 表2 on 连接条件...;
```

### 外连接

#### 左外连接

```mysql
select 字段 from 表1 left [outer] join 表2 on 条件; 
```

相当于查询**左表(表 1)的所有数据和两张表的交集数据**

#### 右外连接

```mysql
select 字段 from 表1 right [outer] join 表2 on 条件; 
```

相当于查询**右表(表 2)的所有数据和两张表的交集数据**

### 自连接

```mysql
select 字段 from 表A 别名A join 表A 别名B on 条件；
```

自连接可以是内连接也可以是外连接

### 联合查询

把多次查询的结果合并起来，形成一个新的查询结果集

```mysql
select 字段 from 表A
UNION [ALL]
select 字段 from 表B
```

`UNION ALL` 会直接对查询的结果进行合并, 而 `UNION` 会先进行去重再合并

### 子查询

SQL 语句中嵌套 select 语句，成为嵌套查询，又称子查询

```mysql
select * from t1 where column1 = (select column1 from t2);
```

#### 标量子查询

子查询返回的结果是单个值(数字、字符串、日期等)

**常用的操作符**: `=` `<` `>` `>=` `<=`

#### 列子查询

子查询返回结果是 1 列，可以是多行

**常用操作符**：

| 操作符 | 描述                                        |
| ------ | ------------------------------------------- |
| IN     | 在指定的集合范围之内，多选一                |
| NOT IN | 不在指定的集合范围之内                      |
| ANY    | 子查询返回列表中，有任意一个满足即可        |
| SOME   | 与 ANY 等同，使用 SOME 的地方都可以使用 ANY |
| ALL    | 子查询返回列表的所有值都必须满足            |

```mysql
-- ALL 使用案例：查询比财务部所有人工资都高的员工信息
SELECT * FROM emp 
WHERE salary > all (
    SELECT salary 
    FROM emp 
    WHERE dept_id = (
        SELECT id 
        FROM dept 
        WHERE name = '财务部'
    )
);

-- ANY 使用案例：查询比财务部任意一个人工资高的员工信息
SELECT * FROM emp 
WHERE salary > any (
    SELECT salary 
    FROM emp 
    WHERE dept_id = (
        SELECT id 
        FROM dept 
        WHERE name = '财务部'
    )
);
```

#### 行子查询

子查询返回结果是 1 行，可以是多列

**常用操作符**：`=` `<` `>` `IN` `NOT IN` 

```mysql
-- 案例：查询与 ‘张三’ 的薪资及直属领导相同的员工信息
SELECT * 
FROM emp 
WHERE (salary, managerid) = (
    SELECT salary, managerid 
    FROM emp 
    WHERE name = '张无忌'
);
```

#### 表子查询

子查询返回的结果是多行多列

一般把返回结果**作为一个新表**，与其他表进行联合查询

## 事务

事务是一组操作的集合，是一个不可分割的工作单位

事务会把所有的操作作为一个整体一起向系统提交或撤销操作请求，即这些操作**要么同时成功，要么同时失败**

### 事务操作

查看事务提交方式：

```mysql
select @@autocommit;
```

MySQL 默认是自动提交事务，即执行完一条 DML 语句后，会自动隐式的提交事务

设置事务提交方式:

```mysql
set @@autocommit=0;  -- 设置手动提交事务
```

提交事务：

```mysql
commit;
```

回滚事务：

```mysql
rollback;
```

### 事务四大特性（ACID）

* **原子性**（**A**tomicity）：事务是不可分割的最小单元，要么全部成功，要么全部失败；
* **一致性**（**C**onsistency）：事务完成时，必须使所有的数据都保持一致状态；
* **隔离性**（**I**solation）：数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下运行；
* **持久性**（**D**urability）：事务一旦提交或回滚，它对数据库中的数据改变就是永久的。

### 并发事务问题

#### 脏读

一个事务读到另外一个事务还没有提交的数据

![](https://5a352de.webp.li/2024/10/4af67b63e2024f7d43a4e7e46c1ad29b.png)

#### 不可重复读

一个事务先后读取同一条记录，但两次读取的数据不同

![](https://5a352de.webp.li/2024/10/9d665660ed967e3f9495cda912b994cc.png)

#### 幻读

一个事务按照条件查询数据时，没有对应的数据行，但是在插入数据时，又发现这行数据已经存在了，好像出现了”幻影“

![](https://5a352de.webp.li/2024/10/e33f979592a3b962d66c405cb40db973.png)

### 事务的隔离级别

| 隔离级别               | 脏读 | 不可重复读 | 幻读 |
| ---------------------- | ---- | ---------- | ---- |
| Read uncommitted       | √    | √          | √    |
| Read committed         | ×    | √          | √    |
| Repeatable Read (默认) | ×    | ×          | √    |
| Serializable           | ×    | ×          | ×    |

查看事务隔离级别

```mysql
SELECT @@TRANSACTION_ISOLATION;
```

设置事务隔离级别

```mysql
SET [SESSION | GLOBAL] TRANSACTION ISOLATION LEVEL { READ UNCOMMITTED | READ COMMITTED | REPEATABLE READ | SERIALIZABLE };
```

事务隔离级别越高，数据越安全，但是性能越低