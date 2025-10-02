---
title: SQL JOIN 解析
description: SQL JOIN 操作深度解析
publishDate: 2024-01-27 22:38:12
tags:
- MySQL
- 数据库
heroImage:
  { src: 'https://5a352de.webp.li/2025/10/9919f9c63324359678fa4cb2d97ad91a.png', inferSize: true }
---

SQL中的 `JOIN` 操作是根据两个或多个表之间的相关列将它们合并在一起的查询操作，能够大大提高查询效率，本文将对常用的几种 `JOIN` 操作进行深度解析。

## INNER JOIN

只返回两个表中匹配的行，如果某个表中的行在另一个表中没有匹配的行，则这些行不会出现在结果集中，即求两个表的**交集**。

<img src="https://cdn.jsdelivr.net/gh/sun-i/pic/imagesINNERJOIN.svg" title="" alt="" data-align="center">

```sql
SELECT *
FROM A
INNER JOIN B
ON A.key = B.key;
```

INNER JOIN 可以用于整合不同表中有关联的数据，例如有一个员工表和一个员工薪资表，需要同时查询员工信息和薪资，就可以使用 INNER JOIN 整合两个表的数据。

## LEFT JOIN

返回左表（第一个表）的所有行，即使右表（第二个表）中没有匹配的行。如果右表中没有匹配的行，结果集中的右表列将填充NULL值。

<img src="https://cdn.jsdelivr.net/gh/sun-i/pic/imagesLEFTJOIN.svg" title="" alt="" data-align="center">

```sql
SELECT *
FROM A
LEFT JOIN B
ON A.key = B.key;
```

同样是员工表和薪资表，如果并不是所有员工都有薪资记录，因为他们刚刚加入公司，或者薪资数据还未更新等，我们想要查询所有员工的信息和薪资，就得允许结果集中存在薪资为 `NULL` 的数据，这个时候就需要用到 LEFT JOIN。

## LEFT JOIN (sans l'intersection de B)

`sans l'intersection de B` 是法语，意为没有B的交集，即在 `LEFT JOIN` 的结果集中，排除在两个表中都有匹配的记录。

<img src="https://cdn.jsdelivr.net/gh/sun-i/pic/imagesSANSB.svg" title="" alt="" data-align="center">

```sql
SELECT *
FROM A
LEFT JOIN B
ON A.key = B.key
WHERE B.key IS NULL;
```

假设我们有两个表，一个是客户表，一个订单表。我们想要查询那些在订单表中没有订单的客户信息，就需要使用 `LEFT JOIN (sans l'intersection de B)` 排除在两个表中都有匹配的数据。

## RIGHT JOIN

`RIGHT JOIN` 的使用与 `LEFT JOIN` 相反，它保留右表的所有记录，即使左表中没有匹配的记录。在结果集中，右表中的所有记录都会显示，而左表中没有匹配的记录对应的列将显示为NULL。