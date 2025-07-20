// components/PostCard/hooks/useEmojiAnimation.js

export function useEmojiAnimation(likeIconRef, post, currentUser) {
  // Trigger like animation
  const triggerLikeAnimation = () => {
    if (!likeIconRef.current) return;

    likeIconRef.current.classList.add("animate-ping");
    setTimeout(() => {
      likeIconRef.current?.classList.remove("animate-ping");
    }, 300);
  };

  // Return both functions (only triggerLikeAnimation here; triggerReactionEffect is separate)
  return { triggerLikeAnimation };
}

export function triggerReactionEffect(emoji) {
  const container = document.createElement("div");
  container.className = "fixed text-3xl pointer-events-none z-50";
  container.style.left = `${Math.random() * 80 + 10}%`;
  container.style.top = "70%";
  container.textContent = emoji;

  document.body.appendChild(container);

  const animation = container.animate(
    [
      { transform: "translateY(0)", opacity: 1 },
      { transform: "translateY(-100px)", opacity: 0 }
    ],
    {
      duration: 1000,
      easing: "ease-out"
    }
  );

  animation.onfinish = () => container.remove();
}
