import App from "next/app";
import { AppThemeProvider } from "components/AppThemeProvider";
import { StateProvider } from "components/state";
// NOTE: For VideoJs components.
import "video.js/dist/video-js.css";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";
import "components/VideoJs.css";

export default class extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <StateProvider>
        <AppThemeProvider>
          <Component {...pageProps} />
        </AppThemeProvider>
      </StateProvider>
    );
  }
}
