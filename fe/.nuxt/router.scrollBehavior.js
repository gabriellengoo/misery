export default function(to, from, savedPosition) {
      // If the user used browser back/forward, restore saved position
      if (savedPosition) {
        return savedPosition;
      }
      // Otherwise, always scroll to top
      return { x: 0, y: 0 };
    }
