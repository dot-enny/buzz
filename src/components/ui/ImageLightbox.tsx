import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

// Custom download function that properly downloads cross-origin images
const handleDownload = async (src: string) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `image-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download image:', error);
    // Fallback: open in new tab
    window.open(src, '_blank');
  }
};

export const ImageLightbox = ({ isOpen, onClose, src, alt }: ImageLightboxProps) => {
  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={[{ src, alt: alt || "Image" }]}
      plugins={[Zoom]}
      carousel={{ finite: true }}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
      }}
      toolbar={{
        buttons: [
          <button
            key="download"
            type="button"
            className="yarl__button"
            onClick={() => handleDownload(src)}
            aria-label="Download"
          >
            <ArrowDownTrayIcon className="w-6 h-6 text-white" />
          </button>,
          "close",
        ],
      }}
      zoom={{
        maxZoomPixelRatio: 5,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
        scrollToZoom: true,
      }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
      }}
      animation={{ fade: 300, swipe: 300 }}
    />
  );
};
