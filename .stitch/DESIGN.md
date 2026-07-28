---
name: Hinov Devis
colors:
  primary: "#F44336"
  secondary: "#009688"
  background: "#e9e9e9"
  surface: "#ffffff"
  text: "#333333"
  textMuted: "#999999"
  border: "#eeeeee"
  success: "#4CAF50"
  warning: "#FF9800"
  error: "#F44336"
  info: "#00BCD4"
---

# Design System: Hinov Devis

**Project ID:** HinovDevisV1

## 1. Visual Theme & Atmosphere

L'esthétique globale est basée sur le Material Design classique. Elle est propre, structurée et utilise la profondeur (ombres) pour indiquer la hiérarchie et l'interactivité. L'interface semble professionnelle et fonctionnelle, adaptée à un environnement d'administration et de gestion comme la création de devis.

L'espacement est généreux mais organisé en grilles strictes. Les couleurs sont vibrantes et utilisées stratégiquement pour attirer l'attention sur les actions principales et les statuts (ex: devis validés, refusés).

## 2. Color Palette & Roles

### Primary Foundation
- **Primary Red** (`#F44336`): Utilisé pour les actions principales, l'en-tête (theme-red par défaut) et les éléments interactifs majeurs.
- **Surface White** (`#ffffff`): Utilisé pour les cartes, les panneaux et les conteneurs de contenu.
- **Background Light Grey** (`#e9e9e9`): Utilisé comme couleur d'arrière-plan de l'application pour faire ressortir les cartes blanches.

### Accent & Interactive
- **Secondary Teal** (`#009688`): Utilisé pour les éléments secondaires, les éléments actifs, et certains indicateurs de focus (comme les datepickers).
- **Interactive Blue** (`#2196F3`): Utilisé pour les liens et les actions d'information.

### Typography & Text Hierarchy
- **Base Text** (`#333333`): Couleur du texte principal pour une lisibilité maximale.
- **Muted Text** (`#999999`): Utilisé pour les sous-titres, le texte secondaire et les placeholders.

### Functional States
- **Success Green** (`#4CAF50`): Pour les devis acceptés ou les actions réussies.
- **Warning Orange** (`#FF9800`): Pour les avertissements ou les devis à réviser.
- **Error Red** (`#F44336`): Pour les devis refusés ou les erreurs de validation.
- **Info Cyan** (`#00BCD4`): Pour les statuts consultés ou les notifications informatives.

## 3. Typography Rules

### Hierarchy & Weights
- **Font Family**: 'Roboto', sans-serif (typographie standard de Material Design).
- **Headings (H1-H6)**: Poids de police généralement réglé sur 400 (Regular) ou 300 (Light) pour les grands titres, pour un aspect moderne et épuré.
- **Body Text**: Poids de police 400 (Regular).
- **Icons**: 'Material Icons' pour l'ensemble de l'iconographie du système.

### Spacing Principles
- La hauteur de ligne est généreuse pour améliorer la lisibilité.
- Les espacements entre les paragraphes et les éléments utilisent des multiples de 4px ou 8px (standard Material).

## 4. Component Stylings

### Buttons
- **Shape**: Légèrement arrondis (border-radius: 2px ou 4px).
- **States**: Effet "Ripple" (Waves effect) au clic. Changement d'opacité ou de légère luminosité au survol. Les boutons principaux ont une ombre portée (box-shadow) qui s'agrandit au survol ou au clic.

### Cards & Dashboards Containers
- **Shape**: Coins légèrement arrondis (border-radius: 2px).
- **Shadow**: Ombre de base (`box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);`) pour créer l'élévation par rapport à l'arrière-plan.
- **Padding**: Spacieux (généralement 20px de padding interne) pour aérer le contenu des widgets.

### Navigation
- **Sidebar**: Fond blanc ou gris très clair. Liens de navigation avec des icônes Material. Un état actif clairement défini avec une couleur de fond subtile et/ou une bordure gauche colorée.
- **Topbar**: Barre de navigation colorée (ex: Primary Red) contenant le logo, la barre de recherche et les icônes de notification.

### Inputs & Forms
- **Style Material**: Les champs de formulaire n'ont qu'une bordure inférieure. La bordure s'anime et change de couleur (Secondary Teal) lors du focus. Les labels flottent au-dessus de l'entrée lorsqu'elle est remplie.

## 5. Layout Principles

### Grid & Structure
- **Système de grille**: Basé sur Bootstrap (12 colonnes) pour un contrôle précis des widgets du tableau de bord.
- **Max-width**: La mise en page s'étend sur toute la largeur (fluid) avec un menu latéral rétractable.

### Whitespace Strategy
- Espaces de 15px à 30px entre les widgets (gouttières de la grille Bootstrap).

### Responsive Behavior & Touch
- **Mobile First**: Le menu latéral se transforme en un tiroir (drawer) glissant (off-canvas) sur les petits écrans. Les widgets s'empilent verticalement sur mobile.

## 6. Design System Notes for Stitch Generation

### Language to Use
- "Utilisez une esthétique Material Design avec des cartes blanches élevées (ombres portées) sur un fond gris clair."
- "Appliquez la police Roboto. Utilisez des champs de formulaire avec uniquement une bordure inférieure et des labels flottants."

### Color References
- Utilisez `#F44336` (Red) pour la barre de navigation principale et les boutons d'action primaire.
- Utilisez `#4CAF50` (Green) pour les statuts "Accepté" et `#FF9800` (Orange) pour "À réviser".

### Component Prompts
- **Widget Dashboard** : "Créez une carte d'information Material Design avec une icône à gauche, un titre et un grand chiffre à droite. Utilisez une légère ombre portée."
- **Tableau de Devis** : "Générez un tableau de données épuré avec des lignes séparées par de fines bordures, sans bordures verticales. Incluez une colonne de statut avec des badges colorés (vert, orange, rouge)."

### Incremental Iteration
- Commencez par générer la structure (Topbar rouge + Sidebar blanche).
- Remplissez ensuite avec les cartes (widgets) sur le fond gris.
- Affinez les détails (formulaires Material, ombres).
