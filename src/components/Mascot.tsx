import { motion } from "framer-motion";
import mascot from "@/assets/mascot.png";

export default function Mascot({ size = 96, bouncing = true }: { size?: number; bouncing?: boolean }) {
  return (
    <motion.img
      src={mascot}
      alt="Visi the travel guide mascot"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      animate={bouncing ? { y: [0, -6, 0] } : undefined}
      transition={bouncing ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : undefined}
      className="select-none drop-shadow-md"
      draggable={false}
    />
  );
}