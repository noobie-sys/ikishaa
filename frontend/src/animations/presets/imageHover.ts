import gsap from "gsap";

export const imageHover = (element: HTMLElement) => {
  const enter = () => {
    gsap.to(element, {
      scale: 1.04,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const leave = () => {
    gsap.to(element, {
      scale: 1,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  element.addEventListener("mouseenter", enter);
  element.addEventListener("mouseleave", leave);

  return () => {
    element.removeEventListener("mouseenter", enter);
    element.removeEventListener("mouseleave", leave);
  };
};
