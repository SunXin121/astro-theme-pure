---
title: 89 things I know about Git commits
description: Git 提交的89个要点
publishDate: 2024-07-22 11:33
tags:
- Git
- 编程
heroImage:
  { src: 'http://wallpaper.csun.site/?89', inferSize: true }
---

本文译自: [89 things I know about Git commits · Jamie Tanna | Software Engineer (jvt.me)](https://www.jvt.me/posts/2024/07/12/things-know-commits/)

1.Git 有不同的用途——协作工具、备份工具、文档工具

2.Git 的 commit messages 堪称出色

3.我从没遇到过谁像我一样喜欢阅读 commit messages

4.通过提交记录查找变更原因比通过 issue/bug tracker 更容易

5.标注为 ‘Various fixes. DEV-123’ 的 commit, 要比只写 ‘Various fixes’ 的更好

6.如果 issue 本身没有任何有用信息，那么提交说明“Various fixes. DEV-123”是更糟糕的

7.Rebase-merging 是我的偏好. 然后是 squash-merge, 再然后是 merge

**Rebase-merging** 指先 rebase 再 merge, 将当前分支的所有提交 "移植" 到目标分支的最新提交, 会生成一个线性的提交历史, 例如原来的分支可能是这样的

```
main:    A---B---C
               \
feature:         D---E---F
```

rebase 后变成

```
main:    A---B---C
                    \
feature:             D'---E'---F'
```

再 merge 后变成

```
main:    A---B---C-------M
                         / \
feature:                 D'---E'---F'
```

这样可以使提交历史变得线性，更加整洁，便于阅读，并且仍然保留了分支合并的历史

**squash-merge** 会把分支上的所有更改压缩成一个未提交的快照，并合并到目标分支

```
git merge --squash feature
```

最终的提交历史会变成

```
main:    A---B---C---G
feature:        \    
                D---E---F
```

其中 `G` 是压缩后的单个提交，包含了 `D`, `E`, `F` 的所有更改

8.如果你不学习如何 rebase，你就错失了一个很好的技能

9.当事情出错时说“只要删除库”的人真的让我很烦

10.学习如何使用 `git reflog`，它会帮你恢复删除的仓库

11.掌握如何使用 `git reflog` ，你就能避免一些不算太严重的错误

12.学习各种复杂工具和命令并不能避免你时不时犯错

13.我最近一次拙劣的 rebase 发生在上周，我需要 `git reflog` 来帮我搞定

14.学习如何撤销 `force push`，然后学习如何更安全地 `force push`（记住 `=ref` ！）

[How to Undo a `git push --force` · Jamie Tanna | Software Engineer (jvt.me)](https://www.jvt.me/posts/2021/10/23/undo-force-push/)

[Safely Force Pushing with Git using `--force-with-lease=ref` · Jamie Tanna | Software Engineer (jvt.me)](https://www.jvt.me/posts/2018/09/18/safely-force-git-push/)

15.Squashing是对精心编写的原子提交的一种浪费

16.Squashing 比100次糟糕的提交要好

17.Squash时，先 squash，再写一条好的 commit message，这是很好的做法

18.直接删除，然后不重新编辑 commit message 是最糟糕的

19.Squash时, 当你有100个糟糕的提交时，不重新编写 commit message 是一种犯罪

20.Squash时， 不重新编辑 commit message， 这比从包含100个垃圾提交的分支出合并提交更糟糕

21.撰写一份内容翔实的 PR/MR description， 却不用于通知 squash-merge message， 这是浪费时间

22.编写 commit message 有助于我找出遗漏的测试用例、遗漏的文档或无效的思考过程，因为它有助于我重新编写更改的原因

23.使用您的 `git log` 作为更新的指示是有效的

24.我不会费心在我的提交上签名（除非迫不得已）

25.如果需要签署提交，SSH密钥签名几乎不会让人感到讨厌

26.如果您需要在存储库之间移动文件，则需要使用 `git subtree` 保持历史记录的完整性

[Merging multiple repositories into a monorepo, while preserving history, using `git subtree` · Jamie Tanna | Software Engineer (jvt.me)](https://www.jvt.me/posts/2018/06/01/git-subtree-monorepo/)

27.提交应该是原子性的——所有的代码、测试和配置更改都应该包含在内

28.我花费了大量时间来确保每个提交都能自动通过CI检查。

29.有些人会做出可怕的事情，比如将实现代码和测试代码分开

30.将文档放在单独的提交中是可以的——我们不必在单个提交中提供完整的端到端功能

31.使用 squash-merges 的仓库很糟糕

32.作为开源项目的维护者，我喜欢使用“squash-merge”，这样我就可以重写贡献者的提交消息

33.有时，指导如何撰写特定的 commit message 并不值得。

34.你身边的人塑造了你的写作风格。

35.提前做好工作，使你的提交历史具有原子性

36.事后将一个巨大的提交拆分成多个原子提交，这要痛苦得多

37.将工作原子化有助于提高你的回报动力——你可以完成更多的事情

38.原子提交与 [Prefactoring](https://www.jvt.me/posts/2022/04/12/prefactor/)配合得非常好

39.有时 prefactoring 提交可以进入单独的PR（特别是使用合并时）

40.编写 commit message 可能比实现本身花费的时间更长

41.commit message 的长度可能比提交中修改的行数多一个数量级

42.如果您在 commit message 中写了很多“和”或“也”，可能是因为您想做的事情太多了

43.翻阅 Git 的提交历史，我解开了一些谜团，让我理解了为什么没有原作者来回答我的问题。

44.commit message 不仅能够反映你做了什么，还能反映你为什么这么做，值得深思

45.为什么比什么更重要——任何人都可以查看差异，并大致弄清楚做了哪些改动，但背后的意图才是关键

46.如果你只写发生了什么变化，那你就很烦人，我不喜欢你

47.一个解释说明的提交比一个只有“修复”的提交要好

48.Chris Beams 的文章 [How to Write a Git Commit Message](https://cbea.ms/git-commit/) 在近10年后仍然是一篇优秀的文章，也是很好的入门读物！

49.提交是对提交者假设和世界状态的特定时间点的解释。不要对他们过于苛刻

50.我不想看AI/LLM重写你的修改——要么自己写，要么把它称为 `Various fixes`

51.需要有一种方法（也许使用 `git notes` ）在之前的留言中添加注释，以纠正假设

52.我不会事先写完美的提交消息——有时它们会像 `rew! add support for SBOMs` 或 `sq` 一样长，或者使用 `git commit --fixup`

53.一般来说，我会将非常优秀的原子工作分解提交

54.我将把原子提交拆分成多个提交，有时

55.在发送给合作者审阅之前，请务必检查自己的代码更改

56.查看提交消息与查看代码更改同样重要

57.让所有贡献者对提交历史投入同样的关注，这是一场必输的战争

58.试图规范历史将会是痛苦的

59.试图强制要求对提交消息进行审查，将其作为代码审查的一部分，这将会非常痛苦

60.试图监管历史的确会导致对代码库中的更改进行更详细的记录和考虑

61.将隐含的假设明确化确实很有用

62.介绍 `commitlint` 可能有用，但也可能令人沮丧

63.让您的合作者主动撰写优秀的提交消息，总比您强迫他们写要好。

64.有些人不写，这没关系

65.写作是一种技能

66.我的写作（commit message）水平并不完美

67.有时我懒得写完美的信息

68.有时我写一些非常棒的提交消息，我自己都印象深刻

69.使用模板来编写 Git 提交消息是正确操作的良好开端

[Saving Repetition with Git Commit Templates · Jamie Tanna | Software Engineer (jvt.me)](https://www.jvt.me/posts/2017/04/17/commit-templates/)

70.`fixup` 提交和 `git rebase --autosquash` 是我学到的最好的Git技巧之一

71.我珍视与拥有不同视角、技能和工作方法的团队共事的机会

72.但我也很珍视拥有一支团队，他们撰写原子提交时附上了精心撰写的提交消息

73.撰写任务信息与撰写精心设计的用户故事/工单一样有用

74.`git commit -m sq` 可能是我最常用的命令

75.使用 `git add -p` 和 `git commit -p` 对于原子提交非常重要

76.切勿使用 `git add -u` 或 `git add .`

77.了解何时可以使用 `git add -u` 或 `git add .`

78.我确实需要研究一下Graphite、 `git-branchless` 等工具，以及其它提供 stacked PR 设置的方法

79.当需要自动发布时时，使用 [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)与 [semantic-release](https://github.com/semantic-release/semantic-release)或[go-semantic-release](https://github.com/go-semantic-release/semantic-release)会有很大的不同。

80.将  [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) 作为提交框架确实很有用

81.对于多动症患者来说，使用  [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) 有时可以减少思考，让你更专注于更改的内容

82.当您尝试在一次提交中完成过多操作时，使用  [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) 可以帮助您解决问题

83.我认为通过写作传达信息有助于理解我做事的原因

84.写一条好的提交消息比写一份文档要好，文档可以存储在其他地方

85.写一个好的提交消息比写代码注释要好

86.给人们学习的空间

87.给人们失败的空间

88.请记住，你曾经也不是那么优秀

89.文档制作很棒。多做一些