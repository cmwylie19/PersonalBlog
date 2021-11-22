---
title: Remove files from Git history
date: "2021-11-22T22:40:32.169Z"
description: Remove files from Git history
---
Most of us have committed files to a public repo by mistake at least one in our careers and we need to remove the history of that file.


In order to clear a file from Git History, run the following:
```
git filter-branch --index-filter "git rm -rf --cached --ignore-unmatch path_to_file" HEAD
```

then to push to the remote repo do a `git push --all`