#!/usr/bin/expect -f

set timeout 30
spawn ssh pashland@167.235.7.222

expect "password:"
send "yL5uK0uN8v\r"

expect "$ "
send "cd /var/www/pashland/data/www/g-shop.info\r"

expect "$ "
send "mv frontend/* .\r"

expect "$ "
send "rmdir frontend\r"

expect "$ "
send "ls -la\r"

expect "$ "
send "exit\r"

expect eof