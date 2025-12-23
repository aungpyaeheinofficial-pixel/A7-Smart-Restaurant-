
# Assumptions & Constraints

1. **User Identity**: The application assumes the current user is "Sarah Chen (Manager)" for all administrative tasks. In a multi-user environment, we would use a proper `AuthContext`.
2. **Tax Rate**: A flat 8% tax rate is applied globally to all menu items.
3. **Table Position**: Table coordinates are currently stored as simple `x/y` properties but rendered in a responsive grid for this MVP to ensure stability across mobile/desktop views.
4. **Mock Latency**: 200ms artificial latency is applied to all "API" calls to demonstrate loading states and async handling.
5. **Kitchen Sound**: Audio dings are simulated via console logs and visual toast updates as standard browsers block auto-playing audio without user interaction.
6. **Responsive POS**: On small screens, the POS columns stack vertically. A tablet or larger screen is recommended for the best "terminal" experience.
