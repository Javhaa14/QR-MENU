import type { FooterProps } from "@qr-menu/shared-types";

export default function Minimal({ restaurant }: FooterProps) {
  return (
    <footer className="flex items-center justify-between border-t border-black/10 pt-6 text-sm text-black/55">
      <span>{restaurant.name}</span>
      <span>QR Menu систем</span>
    </footer>
  );
}
