import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { Play } from "lucide-react";

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  owner: string;
  file: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const data = await api.getVideos();
        setVideos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch videos");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900"></div>
          <p className="mt-4 text-neutral-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-neutral-900">Videos</h1>
            <Link
              to="/"
              className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Videos Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {videos.length === 0 ? (
          <div className="text-center">
            <p className="text-neutral-600 text-lg">No videos available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <Link
                key={video._id}
                to={`/player/${video._id}`}
                className="group cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  {/* Thumbnail Container */}
                  <div className="relative w-full aspect-video bg-neutral-200 overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
                      <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Duration Badge */}
                    {video.duration > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 rounded text-sm font-semibold">
                        {Math.floor(video.duration / 60)}:
                        {String(video.duration % 60).padStart(2, "0")}
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 truncate group-hover:text-neutral-700">
                      {video.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                      <span className="font-medium">{video.owner}</span>
                      <span>
                        {video.views} view{video.views !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
