# Les Bâtisseurs du Pays · Page de vente

Page de vente de la cohorte fondatrice, hébergée sur Vercel et modifiable avec l'éditeur Pages CMS.

## Où sont les textes

Tous les textes, prix et liens sont dans `content/page.json`. Les photos vont dans `public/images`.
Le style est dans `src/styles.css` et la mise en page dans `src/template.html` : inutile d'y toucher pour changer un texte.

## Modifier la page avec l'éditeur

1. Ouvrir https://app.pagescms.org et se connecter avec GitHub.
2. Choisir ce dépôt, puis « Page de vente ».
3. Modifier les champs, puis cliquer sur « Save ».
4. Vercel republie automatiquement la page en une minute environ.

Dans les paragraphes, on peut mettre un mot en gras avec `<strong>mot</strong>` et en jaune avec `<span class="y">phrase</span>`.

## Mettre en ligne sur Vercel (une seule fois)

1. Sur https://vercel.com, « Add New… » puis « Project ».
2. Importer ce dépôt GitHub. Les réglages sont lus dans `vercel.json`, il n'y a rien à changer.
3. Cliquer sur « Deploy ». Pour un nom de domaine, aller dans « Settings » puis « Domains ».

## Tester sur son ordinateur

```
npm install
npm run build
```

La page générée est dans `dist/index.html`.
