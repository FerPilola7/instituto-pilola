// Constantes de la aplicación

export const APP_NAME = "Instituto de Artes Pilola";
export const APP_DESCRIPTION =
  "Desarrolla tu talento artístico. Acumula puntos, canjea beneficios y forma parte de la comunidad Pilola.";

// Paleta de colores
export const COLORS = {
  black: "#050505",
  greenNeon: "#37D84C",
  greenDark: "#0F3B19",
  white: "#FFFFFF",
  grayMuted: "#9CA3AF",
  glassBg: "rgba(15, 59, 25, 0.15)",
  glassBorder: "rgba(55, 216, 76, 0.12)",
} as const;

// Puntos por defecto por mensualidad
export const POINTS_PER_PAYMENT = 100;

// Clases disponibles
export const CLASSES = [
  {
    id: "musica",
    title: "Música",
    description: "Aprende guitarra, piano, canto y teoría musical con maestros profesionales.",
    icon: "🎵",
    gradient: "from-emerald-500 to-green-700",
  },
  {
    id: "pintura",
    title: "Pintura",
    description: "Domina técnicas de óleo, acrílico, acuarela y arte contemporáneo.",
    icon: "🎨",
    gradient: "from-green-400 to-emerald-600",
  },
  {
    id: "dibujo",
    title: "Dibujo",
    description: "Desarrolla tus habilidades con grafito, carboncillo, digital y más.",
    icon: "✏️",
    gradient: "from-lime-500 to-green-600",
  },
  {
    id: "danza",
    title: "Danza",
    description: "Explora ballet, contemporáneo, folclórico y danza urbana.",
    icon: "💃",
    gradient: "from-teal-400 to-emerald-500",
  },
  {
    id: "teatro",
    title: "Teatro",
    description: "Actúa, improvisa y desarrolla tu expresión escénica.",
    icon: "🎭",
    gradient: "from-green-500 to-teal-600",
  },
] as const;

// Testimonios de ejemplo
export const TESTIMONIALS = [
  {
    id: 1,
    name: "María González",
    role: "Alumna de Música",
    quote:
      "El Instituto Pilola transformó mi pasión por la música en algo real. Los maestros son increíbles y el sistema de puntos me motiva cada mes.",
    avatar: "MG",
  },
  {
    id: 2,
    name: "Carlos Ramírez",
    role: "Alumno de Pintura",
    quote:
      "Desde que entré al instituto, mi arte ha crecido enormemente. Las promociones exclusivas son un gran incentivo para seguir aprendiendo.",
    avatar: "CR",
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Alumna de Danza",
    quote:
      "Me encanta la comunidad artística de Pilola. La credencial digital y el código QR hacen todo súper práctico.",
    avatar: "AM",
  },
  {
    id: 4,
    name: "Diego López",
    role: "Alumno de Teatro",
    quote:
      "El mejor instituto de artes de la ciudad. La app es moderna, el ambiente es increíble y los beneficios son geniales.",
    avatar: "DL",
  },
] as const;
