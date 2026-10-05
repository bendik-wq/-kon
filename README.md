# Økonomi – HSM122 Innføring i bedriftsøkonomi

Samlet studiemappe for bedriftsøkonomi / bedriftsregnskap: notater, oppgaver, løsninger og formelark per modul.

## Struktur

```
bedriftsregnskap/
  modul-01-introduksjon/
  modul-02-inntekts-og-kostnadsbegreper/
    README.md     – oversikt, sjekkliste for videoer/PDF, nøkkelbegreper
    notater.md    – egne notater
    oppgaver/     – oppgaver du løser (egne filer, regneark osv.)
    losninger/    – løsningsforslag / egne løsninger
    materiell/    – kurs-PDF-er (lagres lokalt, ignoreres av git)
formelark.md      – offisielt HSM122-formelark, ordnet etter tema
eksempler/       – løste eksempeloppgaver i Excel
maler/            – maler for nye moduler og notater
```

## Ny modul

1. Kopier `maler/modul-mal.md` til `bedriftsregnskap/modul-XX-navn/README.md`
2. Opprett `materiell/`, `oppgaver/`, `losninger/` og en `notater.md` (kopi av `maler/notat-mal.md`)
3. Legg nye formler inn i `formelark.md`

## Moduler

| # | Modul | Status |
|---|-------|--------|
| 1 | [Introduksjon](bedriftsregnskap/modul-01-introduksjon/) | ☐ |
| 2 | [Inntekts- og kostnadsbegreper](bedriftsregnskap/modul-02-inntekts-og-kostnadsbegreper/) | ☐ |

## Nettside

Repoet er også en nettside (GitHub Pages): **https://bendik-wq.github.io/-kon/**
`index.html` leser `formelark.md` og modulmappene direkte, så det holder å oppdatere markdown-filene.
Lokalt: `python -m http.server` i mappen og åpne http://localhost:8000.

## Eksempeloppgaver (Excel)

[`eksempler/HSM122_eksempeloppgaver.xlsx`](eksempler/HSM122_eksempeloppgaver.xlsx) har ett ark per tema i formelarket med oppgavetekst, inndata og løsning.
Alle svar er Excel-formler: endre de blå/gule inndatacellene, så regnes svarene ut på nytt.
