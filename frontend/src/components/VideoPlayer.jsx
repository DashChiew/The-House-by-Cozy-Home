// Helper to embed YouTube or Vimeo or play direct MP4 files
export default function VideoPlayer({ url }) {
  if (!url) return null;

  // YouTube match
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    return (
      <div className="video-wrapper">
        <iframe
          src={embedUrl}
          title="Room Video Tour"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Vimeo match
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return (
      <div className="video-wrapper">
        <iframe
          src={embedUrl}
          title="Room Video Tour"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Fallback to standard html5 video tag if mp4 or generic video file
  return (
    <div className="video-wrapper">
      <video src={url} controls className="video-element">
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
