// Génère dist/index.html à partir de content/page.json et src/template.html
const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const data = JSON.parse(read('content/page.json'));

// Sceau dentelé de la garantie
const pts = [];
for (let i = 0; i < 96; i++) {
  const r = i % 2 === 0 ? 100 : 92;
  const a = (Math.PI * i) / 48;
  pts.push(`${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`);
}
data.seal = pts.join(' ');
data.icones = Mustache.render(read('src/icons.svg.html'), data);

const illus = (name) => {
  const f = path.join(root, 'src/illustrations', `${name}.svg`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : read('src/illustrations/programme.svg');
};
data.bonus.liste.forEach((b, i) => {
  b.classe = i % 2 === 0 ? 'alt' : 'rev';
  b.dessin = illus(b.illustration);
});
// Accepte n'importe quel lien YouTube ou Vimeo et le convertit en lien d'intégration
const toEmbed = (url) => {
  if (!url) return '';
  url = url.trim();
  let m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`;
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return url;
};
data.hero.video_embed = toEmbed(data.hero.video_embed);
data.faq.questions.forEach((q, i) => { q.premiere = i === 0; });

const partials = {
  logo: '<div class="logo"><svg><use href="#mark"/></svg><span><span class="l1">LES BÂTISSEURS</span><span class="l2">DU PAYS</span></span></div>',
  cta: `<div class="cta-row"><a class="cta" href="{{liens.paiement_cohorte}}"><b>{{bouton.texte}}</b><span><svg class="coin"><use href="#coin"/></svg>{{bouton.sous_texte}}</span></a></div>`,
};

const html = Mustache.render(read('src/template.html'), data, partials);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
fs.copyFileSync(path.join(root, 'src/styles.css'), path.join(root, 'dist/styles.css'));
if (fs.existsSync(path.join(root, 'public'))) fs.cpSync(path.join(root, 'public'), path.join(root, 'dist'), { recursive: true });
console.log('dist/index.html généré');
