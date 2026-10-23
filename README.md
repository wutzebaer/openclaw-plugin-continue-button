# Continue Button

Zeigt in der Control UI einen **Continue**-Button in der Kopfzeile der ausgewählten Session. Der Button ist nur sichtbar, solange diese Session einen laufenden Agent-Turn hat. Ein Klick stellt den Text `continue` für den nächsten Turn zurück.

## Bauen und installieren

```sh
npm install
npm run build
openclaw plugins install --link .
```

Für die Anzeige in der Control UI muss `gateway.controlUi.experimental.customPlugins` auf `true` stehen. Danach den Browser-Tab neu laden.
