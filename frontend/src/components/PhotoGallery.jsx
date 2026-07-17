import { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import './PhotoGallery.css';

export default function PhotoGallery({ photos = [], videoUrl = null }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Prepare media list, video is first (default) if present
  const media = [];
  if (videoUrl) {
    media.push({ type: 'video', url: videoUrl });
  }
  photos.forEach(p => {
    media.push({ type: 'photo', url: p.photo_url, id: p.id });
  });

  if (media.length === 0) {
    return (
      <div className="gallery-placeholder">
        <span>🏠</span>
        <p>No photos available</p>
      </div>
    );
  }

  const activeItem = media[active];

  return (
    <>
      <div className="gallery">
        {/* Main Photo or Video */}
        {activeItem.type === 'video' ? (
          <div className="gallery__main gallery__main--video" id="gallery-main-video">
            <VideoPlayer url={activeItem.url} />
            {media.length > 1 && (
              <>
                <button
                  className="gallery__nav gallery__nav--prev"
                  onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + media.length) % media.length); }}
                  id="gallery-prev-btn"
                >‹</button>
                <button
                  className="gallery__nav gallery__nav--next"
                  onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % media.length); }}
                  id="gallery-next-btn"
                >›</button>
              </>
            )}
            <div className="gallery__counter">{active + 1} / {media.length}</div>
          </div>
        ) : (
          <div className="gallery__main" onClick={() => setLightbox(true)} id="gallery-main-photo">
            <img src={activeItem.url} alt="Property" className="gallery__main-img" />
            <div className="gallery__overlay">
              <span className="gallery__expand-icon">⛶</span>
            </div>
            {media.length > 1 && (
              <>
                <button
                  className="gallery__nav gallery__nav--prev"
                  onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + media.length) % media.length); }}
                  id="gallery-prev-btn"
                >‹</button>
                <button
                  className="gallery__nav gallery__nav--next"
                  onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % media.length); }}
                  id="gallery-next-btn"
                >›</button>
              </>
            )}
            <div className="gallery__counter">{active + 1} / {media.length}</div>
          </div>
        )}

        {/* Thumbnails */}
        {media.length > 1 && (
          <div className="gallery__thumbs">
            {media.map((item, i) => (
              <button
                key={item.id || `media-${i}`}
                id={`gallery-thumb-${i}`}
                className={`gallery__thumb${i === active ? ' active' : ''} ${item.type === 'video' ? 'gallery__thumb--video' : ''}`}
                onClick={() => setActive(i)}
              >
                {item.type === 'video' ? (
                  <div className="gallery__thumb-video-placeholder">
                    <span className="play-icon">🎥</span>
                  </div>
                ) : (
                  <img src={item.url} alt={`Photo ${i + 1}`} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)} id="lightbox-overlay">
          <button className="lightbox__close" onClick={() => setLightbox(false)}>✕</button>
          <button
            className="lightbox__nav lightbox__nav--prev"
            onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + media.length) % media.length); }}
          >‹</button>
          {activeItem.type === 'video' ? (
            <div className="lightbox__video" onClick={e => e.stopPropagation()} style={{ width: '80%', maxWidth: '800px' }}>
              <VideoPlayer url={activeItem.url} />
            </div>
          ) : (
            <img src={activeItem.url} alt="Property" className="lightbox__img" onClick={e => e.stopPropagation()} />
          )}
          <button
            className="lightbox__nav lightbox__nav--next"
            onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % media.length); }}
          >›</button>
        </div>
      )}
    </>
  );
}
