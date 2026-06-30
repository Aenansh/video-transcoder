import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api";
import { ArrowLeft } from "lucide-react";
import { MyPlayer } from "../components/MyPlayer"; // Import your new component

// The shape of your video data from the backend
interface VideoData {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  owner: string;
  file: string; // The URL to the .m3u8 or .mp4
  isPublished: boolean;
  views: number;
  createdAt: string;
}

export default function VideoPlayer() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the video data when the page loads
  useEffect(() => {
    if (!videoId) return;

    const fetchVideo = async () => {
      try {
        setLoading(true);
        const data = await api.getVideoById(videoId);
        setVideo(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131314]">
        <div className="text-center text-[#E3E3E3]">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A8C7FA] border-r-transparent border-l-transparent"></div>
          <p className="mt-4 text-[#C4C7C5]">Loading video...</p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131314]">
        <div className="text-center text-[#E3E3E3]">
          <p className="text-[#FF897D] font-medium text-lg mb-4">
            {error || "Video not found"}
          </p>
          <button
            onClick={() => navigate("/videos")}
            className="px-5 py-2.5 bg-[#1E1F20] hover:bg-[#333537] border border-[#444746] rounded-xl transition-colors inline-flex items-center gap-2 text-[#E3E3E3]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Videos
          </button>
        </div>
      </div>
    );
  }

  // Success Screen (The Main UI)
  return (
    <div className="min-h-screen bg-[#131314] text-[#E3E3E3] font-sans selection:bg-[#A8C7FA] selection:text-[#131314]">
      {/* Header with Back Button */}
      <div className="bg-[#131314] px-4 py-4 border-b border-[#444746] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 text-[#8E918F] hover:text-[#A8C7FA] transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Videos
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* The Video Player Container */}
        <div className="mb-8 bg-[#1E1F20] rounded-2xl overflow-hidden border border-[#444746] shadow-2xl">
          <div className="aspect-video bg-black w-full h-full">
            <MyPlayer src={video.file} poster={video.thumbnail} />
          </div>
        </div>

        {/* Video Information & Metadata */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-medium mb-3 tracking-tight">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#C4C7C5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#333537] flex items-center justify-center font-bold text-[#A8C7FA]">
                  {video.owner?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="font-medium text-[#E3E3E3]">
                  {video.owner || "Unknown User"}
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-[#444746]"></span>
              <span>{video.views.toLocaleString()} views</span>
              <span className="w-1 h-1 rounded-full bg-[#444746]"></span>
              <span>
                {new Date(video.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-[#1E1F20] p-5 sm:p-6 rounded-2xl border border-[#444746]">
            <h2 className="text-lg font-medium mb-3 text-[#E3E3E3]">
              Description
            </h2>
            <p className="text-[#C4C7C5] whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {video.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
