// components/Post/ImageGallery.js
export default function ImageGallery({ images, onImageClick, isRestricted }) {
  if (!images?.length) return null;

  return (
    <div className="mt-2 flex gap-2 overflow-x-auto max-w-full">
      {images.map((image, index) => (
        <img
          key={index}
          src={image.url} // ✅ fix here
          alt={`image-${index}`}
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          className={`h-48 w-auto rounded-lg border cursor-pointer object-contain ${isRestricted ? 'select-none' : ''}`}
          onClick={() => onImageClick(index)}
        />
      ))}
    </div>
  );
}
