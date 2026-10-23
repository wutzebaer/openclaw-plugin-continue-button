# Continue Button

Zeigt in der Control UI einen **Continue**-Button mit Play-Icon direkt neben dem Senden-Button der ausgewählten Session. Der Button ist sichtbar, sobald in dieser Session nichts mehr läuft. Ein Klick sendet die Nachricht `continue`.

## Bauen und installieren

```sh
npm install
npm run build
openclaw plugins install --link .
```

Für die Anzeige in der Control UI muss `gateway.controlUi.experimental.customPlugins` auf `true` stehen. Danach den Browser-Tab neu laden.
