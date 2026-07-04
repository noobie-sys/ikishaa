export type EditorialStripSlide = {
  image: {
    url: string;
    alt?: string;
  };
  line1: string;
  line2: string;
};

export type EditorialStripContent = {
  version: 1;
  kind: "editorial-strip";
  header: {
    left: string;
    brand: string;
    right: string;
  };
  slides: EditorialStripSlide[];
};
