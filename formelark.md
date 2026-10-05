# Formelark – HSM122 Innføring i bedriftsøkonomi (H25)

Basert på det offisielle formelarket `HSM122_H25 Formler.pdf` (ligger lokalt i `materiell/`, ikke i git).
Forkortelser: FK/FTK = faste (totale) kostnader, VK/VTK = variable (totale) kostnader, STK = sum totale kostnader,
SEK = sum enhetskostnad, DB = dekningsbidrag, DG = dekningsgrad, DP = dekningspunkt, SI = salgsinntekt, SM = sikkerhetsmargin.

---

## 1. Kostnadsbegreper

| Formel | Uttrykk |
|--------|---------|
| Salgspris | Varekostnad + avanse (bruttofortjeneste) |
| Bruttofortjeneste (kr) | Salgsinntekter − varekostnader = salgspris − varekostnad (inntakskost) |
| Avanse (kr) | Salgsinntekter − varekostnader |
| Bruttofortjenesteprosent | Bruttofortjeneste / salgspris × 100 |
| Avanseprosent | Avanse / varekostnad × 100 |
| Dekningsbidrag (per enhet) | Salgspris − variable kostnader per enhet |
| Dekningsbidrag (totalt) | Salgsinntekter − variable kostnader |
| Dekningsgrad | DB / salgspris |
| Utsalgspris | Varekostnad / (1 − bruttofortjenesteprosent) |
| Salgspris (fra DG) | Variable kostnader / (1 − dekningsgrad) |

> Bruttofortjeneste og avanse er samme kronebeløp. Forskjellen er hva du deler på:
> **BF % deler på salgspris**, mens **avanse % deler på varekostnad**.

### Varekostnad
```
  Inngående beholdning (IB) ved periodens begynnelse
+ Innkjøp i perioden
− Utgående beholdning (UB) ved periodens slutt
= Forbruk (varekostnad)
```
Annen måte: **Varekostnad = varekjøp ± beholdningsendring**

### Avskrivninger
| Formel | Uttrykk |
|--------|---------|
| Lineær avskrivning (årlig) | (Anskaffelseskost − restverdi) / levetid |
| Saldoavskrivning (årlig) | Saldo (bokført) per 1.1 × saldosats |
| Bokført verdi | Anskaffelseskost − påløpte avskrivninger og nedskrivninger |

---

## 2. Kostnadsforløpet

| Formel | Uttrykk |
|--------|---------|
| Sum totale kostnader (STK) | FTK + VTK |
| Sum enhetskostnad (SEK) | STK / mengde |
| Differansekostnad | Endring i STK |
| Grensekostnad / differanseenhetskostnad (DEK) | Endring i STK / endring i mengde |
| Kostnadsoptimal mengde (KOM) | DEK = SEK |

---

## 3. Inntekt og etterspørsel

| Formel | Uttrykk |
|--------|---------|
| Sum totale inntekter (STI) | Pris × mengde |
| Differanseinntekt (DI) | Endring i STI |
| Differanseenhetsinntekt (DEI) | Differanseinntekt / endring i mengde |
| Elastisitetskoeffisient eₚ | (mengdeendring / laveste mengde) / (prisendring / laveste pris) |
| – annen måte | (mengdeendring / laveste mengde) × (laveste pris / prisendring) |

| Etterspørsel | eₚ (tallverdi) |
|--------------|----------------|
| Nøytralelastisk | = 1 |
| Elastisk | > 1 |
| Uelastisk | < 1 |

---

## 4. Markedstilpasning

| Formel | Uttrykk |
|--------|---------|
| Lønnsom beslutning | Grenseinntekt > grensekostnad |
| Vinningsoptimal mengde (pris) | DEI = DEK |
| Dekningsbidrag | Faste kostnader + overskudd (fortjeneste) |
| Maksimalt dekningsbidrag | FTK + maksimalt overskudd |
| Maksimalt overskudd | (Pris − SEK) × vinningsoptimal mengde |
| Dekningspunkt | Pris = SEK |

---

## 5. Kalkulasjon

**Håndverksbedrifter**
Produktkostnader = materialkostnader + timepris + indirekte kostnader

**Industribedrifter – tilleggssatser**

| Avdeling | Tilleggssats = |
|----------|----------------|
| Innkjøp (material) | Indirekte kostnader i innkjøpsavdelingen / direkte materialkostnader |
| Tilvirkning | Indirekte kostnader i tilvirkningsavdelingen / direkte lønn |
| Salg og administrasjon | Indirekte kostnader i salgs- og adm.avdelingen / tilvirkningskostnader |

| Selvkostkalkyle | Bidragskalkyle |
|-----------------|----------------|
| Direkte materialer | Direkte materialer |
| + Direkte lønn | + Direkte lønn |
| + Indirekte kostnader i tilvirkningen | + Indirekte variable kostnader i tilvirkningen |
| **= Sum tilvirkningskostnader** | **= Variable tilvirkningskostnader** |
| + Indirekte kostnader salg og adm. | + Indirekte variable kostnader i salg |
| **= Selvkost** | **= Totale variable kostnader (minimumskost)** |
| + Fortjeneste | + Dekningsbidrag |
| **= Salgspris** | **= Salgspris** |

---

## 6. KVR-analyse (kostnad–volum–resultat)

| Formel | Uttrykk |
|--------|---------|
| Dekningspunkt i enheter | FK / DB per enhet |
| Dekningspunkt i kroner | FK / DG |
| Gjennomsnittlig DG | (DG A × omsetningsandel A) + (DG B × omsetningsandel B) |
| Sikkerhetsmargin i kr | Salgsinntekt i kr − dekningspunktomsetning i kr |
| Sikkerhetsmargin i enheter | Solgte enheter − dekningspunktomsetning i enheter |
| Sikkerhetsgrad (SM %) | (SI − DP i kr) / SI = SM i kr / SI |
| – i enheter | (Solgte enh. − DP i enh.) / solgte enh. = SM i enh. / solgte enh. |
| Målsatt salg i kr | (FK + målsatt overskudd) / DG |
| Målsatt salg i enheter | (FK + overskudd) / DB  eller  salgsinntekt / salgspris per enhet |
| Salgsinntekt | Dekningspunktomsetning / (1 − sikkerhetsgrad) |

> Formelarket skriver «NP» i sikkerhetsgrad-formelen. Det betyr dekningspunkt (DP).

---

## 7. Produktvalg

| Formel | Uttrykk |
|--------|---------|
| DB per knapp faktor | DB per enhet / forbruk av knapp faktor |
| Maksimalt antall enheter | Kapasitet i avdelingen / forbruk per enhet |

Prioriter produktet med høyest **DB per knapp faktor**.

---

## 8. Driftsregnskap og budsjettkontroll

| Formel | Uttrykk |
|--------|---------|
| Tilleggssats | Budsjetterte indirekte kostnader på årsbasis / budsjettert årsaktivitet |
| Kostnadsavvik | Budsjettert beløp − virkelig beløp ifølge regnskapet |

### Avviksanalyse på inntektene
| Formel | Uttrykk |
|--------|---------|
| Inntektsavvik | Virkelig inntekt − budsjettert inntekt |
| Salgsvolumavvik | (Virkelig volum − budsjettert volum) × budsjettert salgspris |
| Salgsprisavvik | (Virkelig pris − budsjettert pris) × virkelig volum |
| Salgets resultatavvik | (Volumavvik × DB per enhet) ± salgsprisavvik |

> Inntektsavvik regnes som **virkelig − budsjett**. Kostnadsavvik regnes motsatt: **budsjett/standard − virkelig**.
> I begge tilfeller betyr positivt tall et gunstig avvik.

---

## 9. Standardkost

| Formel | Uttrykk |
|--------|---------|
| Std. materialkost per enhet | Std. mengde per enhet × std. materialpris |
| Std. materialkost totalt | Std. mengde totalt × std. materialpris |
| Std. lønnskostnad per enhet | Std. tid per enhet × std. lønnssats |
| Std. lønnskostnad totalt | Std. tid totalt × std. lønnssats |
| Std. indirekte kostnader per enhet | Std. tid per enhet × std. tilleggssats per time |
| – alternativt | (Std. tid per enhet × std. lønnssats) × tilleggssats i % |
| Avvik på kostnader | Standardkostnader − realiserte kostnader |

### Materialavvik
| Formel | Uttrykk |
|--------|---------|
| Materialavvik | Prisavvik totalt ± mengdeavvik totalt |
| Materialprisavvik | (Std. pris − virkelig pris) × virkelig mengde |
| Materialmengdeavvik | (Std. mengde − virkelig mengde) × std. pris |

### Lønnsavvik
| Formel | Uttrykk |
|--------|---------|
| Lønnsavvik | Std. lønnskostnad − virkelige lønnskostnader |
| Lønnssatsavvik | (Std. lønnssats − virkelig lønnssats) × virkelig tid |
| Tidsavvik | (Std. tid − virkelig tid) × std. lønnssats |

### Avvik på indirekte kostnader
| Formel | Uttrykk |
|--------|---------|
| Forbruksavvik indirekte VK | (Virkelig tid × std. tilleggssats i kr) − virkelige indirekte VK |
| Forbruksavvik indirekte FK | Budsjetterte indirekte FK − virkelige indirekte FK |
| Effektivitetsavvik indirekte VK | (Std. tid × std. tilleggssats) − (virkelig tid × std. tilleggssats) |
| Beskjeftigelsesavvik indirekte FK | (Std. tid × std. tilleggssats) − budsjetterte indirekte FK |

> Huskeregel: **prisavvik bruker virkelig mengde**, **mengdeavvik bruker standardpris**.

---

## 10. ABC – aktivitetsbasert kalkyle

| Formel | Uttrykk |
|--------|---------|
| Aktivitetssats | Budsjetterte indirekte kostnader på årsbasis / budsjettert årsaktivitet |
| Kostnad for uutnyttet kapasitet | (Planlagt driverforbruk − kapasitet stilt til disposisjon) × aktivitetssats |
| Effektivitetsavvik | (Forventet driverforbruk (standard) − virkelig driverforbruk) × aktivitetssats |
| Forbruksavvik | Norm (budsjett) − virkelige kostnader |
| Resultateffekt av uutnyttet kapasitet | (Virkelig driverforbruk − disponibel kapasitet) × aktivitetssats |

---

## Tillegg – ikke på det offisielle formelarket
Dette står ikke på formelarket, men brukes i modul 2. Kontroller satsene mot pensum.

| Formel | Uttrykk |
|--------|---------|
| Lønnskostnad | Brutto lønn + feriepenger + arbeidsgiveravgift (+ pensjon) |
| Arbeidsgiveravgift | AGA-sats × (lønn + feriepenger) |
| Pris inkl. MVA | Pris ekskl. MVA × (1 + sats) |
| MVA-andel av pris inkl. | Pris inkl. × sats / (1 + sats) |
