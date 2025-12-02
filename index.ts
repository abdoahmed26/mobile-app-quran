import { registerRootComponent } from 'expo';

// Import background task BEFORE the App component
// This ensures the task is defined before any notifications are received
import './src/tasks/adhanBackgroundTask';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
