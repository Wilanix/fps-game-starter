# Cartoon FPS Arena

Un mini FPS 3D en navigateur, avec vue à la première personne, plusieurs armes de raretés différentes, des bots hostile, des décors et un style cartoon.

## Fonctionnalités

- vue FPS avec mouvements WASD + souris
- 5 armes avec dégâts, cadence et rareté différentes
- bots ennemis qui avancent, attaquent et respawnent
- monde 3D avec terrain, maisons, arbres, rochers et autres décors
- HUD avec vie, score, munition et arme actuelle
- écran de fin et bouton de recommencer

## Lancer le jeu

Depuis le dépôt :

```bash
python3 -m http.server 8000
```

Puis ouvrez :

```text
http://localhost:8000
```

## Contrôles

- `W`, `A`, `S`, `D` : déplacement
- `Souris` : regarder autour
- `Clic gauche` : tirer
- `1` à `5` : changer d’arme
- `R` : recharger
- `Echap` : pause / pointer lock

## Armes

- Commun : Pistolet, 18 dmg
- Peu commun : Carabine cactus, 26 dmg
- Rare : Blaster réacteur, 36 dmg
- Épique : Minigun, 52 dmg
- Légendaire : Fusil du soleil, 88 dmg

## Notes

Le projet est volontairement simple et jouable sans dépendance lourde, directement dans le navigateur avec Three.js via CDN.

---

Projet créé pour servir de base à des améliorations futures : ennemis plus avancés, menu, niveaux, son, loot, boss, etc.
