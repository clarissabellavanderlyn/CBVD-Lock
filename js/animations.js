import { prefersReducedMotion } from "./utils.js";

export function animateUnlock(card) {
  if (prefersReducedMotion()) {
    card.classList.add("is-revealed");
    return;
  }
  card.classList.add("is-unlocking");
  setTimeout(() => card.classList.add("is-revealed"), 420);
  setTimeout(() => card.classList.remove("is-unlocking"), 900);
}

export function pulseElement(element) {
  if (!element || prefersReducedMotion()) return;
  element.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.025)" }, { transform: "scale(1)" }],
    { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
}

export function celebrate(container) {
  if (!container || prefersReducedMotion()) return;
  const symbols = ["✦", "✧", "•", "♡", "✦", "·"];
  symbols.forEach((symbol, index) => {
    const node = document.createElement("span");
    node.className = "celebration-particle";
    node.textContent = symbol;
    node.style.setProperty("--i", index);
    node.style.setProperty("--x", `${(index - 2.5) * 34}px`);
    container.appendChild(node);
    setTimeout(() => node.remove(), 900);
  });
}
