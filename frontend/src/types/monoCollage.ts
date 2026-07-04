export type MonoCollageImageKey = "topLeft" | "tallRight" | "main" | "midRight" | "bottomRight";

export type MonoCollageImageRef = {
  url: string;
  alt?: string;
};

export type MonoCollageContent = {
  version: 1;
  kind: "mono-collage";
  images: Record<MonoCollageImageKey, MonoCollageImageRef>;
  label: string;
  caption: string;
};

export const monoCollageImageKeys: MonoCollageImageKey[] = [
  "topLeft",
  "tallRight",
  "main",
  "midRight",
  "bottomRight"
];

export const monoCollageImageLabels: Record<MonoCollageImageKey, string> = {
  topLeft: "top left image",
  tallRight: "tall right image",
  main: "main image",
  midRight: "middle right image",
  bottomRight: "bottom right image"
};
