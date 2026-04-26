import paris from "@/assets/dest-paris.jpg";
import kyoto from "@/assets/dest-kyoto.jpg";
import barcelona from "@/assets/dest-barcelona.jpg";
import bistro from "@/assets/place-bistro.jpg";
import souvenirs from "@/assets/place-souvenirs.jpg";
import museum from "@/assets/place-museum.jpg";
import activity from "@/assets/place-activity.jpg";

export const IMAGES: Record<string, string> = {
  paris, kyoto, barcelona, bistro, souvenirs, museum, activity,
};

export const imageFor = (key: string) => IMAGES[key] ?? paris;