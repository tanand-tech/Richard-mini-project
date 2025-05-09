ssh-keygen -t rsa -b 4096 -m PEM -f key.pem
# Don't add passphrase
C:\'Program Files'\Git\usr\bin\openssl.exe rsa -in key.pem -pubout -outform PEM -out key.pub.pem
Remove-Item key.pem.pub