import { toImageUrl } from "@/helpers/toolsHelper";

interface AvatarProps {
  name?: string | null;
  photo?: string | null;
  size?: number;
  className?: string;
}

// Foto profil pengguna. Jika belum punya foto, tampilkan huruf pertama namanya.
// Ukuran width/height selalu diisi agar tata letak tidak bergeser saat foto dimuat.
function Avatar({ name, photo, size = 40, className = "" }: AvatarProps) {
  const src = toImageUrl(photo);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || "Pengguna"}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={`rounded-full object-cover shrink-0 bg-slate-200 ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      className={`rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold shrink-0 ${className}`}
    >
      {name?.charAt(0)?.toUpperCase() || "U"}
    </span>
  );
}

export default Avatar;