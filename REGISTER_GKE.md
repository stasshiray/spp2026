## Регистрация и создание кластера

1. Идем под VPN, например, польши, в https://cloud.google.com/free
2. Проходим регистрацию, когда потребует адрес, можно сгенерировать рандомом адрес в Варшаве https://www.generatormix.com/random-address-in-warsaw
3. Понадобится ввести номер карты, с которой снимет и вернет 1$ для верефикации. BSB Mastercard в USD проходит. По умолчанию аккаунт будет в режиме Free Trial и при исчерпании кредита деньги сниматься с карты не будут до явной смены настроек оплаты
4. После регистрации идем в раздел Kubernetes Engine и создаем кластер типа Autopilot

## Установка CLI

1. Устанавливаем и инициализируем Gloud CLI по инструкции https://docs.cloud.google.com/sdk/docs/install-sdk
2. Устанавливаем kubectl с расширениями
3. Генерируем `kubeconfig` для установки current context `kubectl`
```
gcloud container clusters get-credentials <name> \
    --location=<region>
``` 
4. Ищем свой кластер через `kubectl config get-contexts` и устанавливаем через `kubectl config use-context ...` 
5. Управляем своим кластером