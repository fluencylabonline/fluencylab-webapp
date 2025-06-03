// Add to imports
import { db } from "@/app/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { FC, useState, useEffect } from "react";
import ReactCalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import toast from "react-hot-toast";
import './heatmap.css';

// Add to interfaces
interface ReviewLog {
  date: string;
  count: number;
}

// Add this component
const ReviewHeatmap: FC = () => {
  const { data: session } = useSession();
  const currentUserId = session?.user.id;
  const [reviewData, setReviewData] = useState<ReviewLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewData = async () => {
      if (!currentUserId) return;

      try {
        const logsRef = collection(db, "users", currentUserId, "reviewLogs");
        const q = query(
          logsRef,
          where(
            "timestamp",
            ">=",
            new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
          )
        );
        const snapshot = await getDocs(q);

        const counts: Record<string, number> = {};
        snapshot.forEach((doc) => {
          const date = doc.data().timestamp.split("T")[0];
          counts[date] = (counts[date] || 0) + 1;
        });

        const formattedData = Object.keys(counts).map((date) => ({
          date,
          count: counts[date],
        }));

        setReviewData(formattedData);
      } catch (error) {
        console.error("Error fetching review data:", error);
        toast.error("Failed to load review history");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [currentUserId]);

  if (loading)
    return <div className="text-center py-10">Loading heatmap...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4 text-center">
        Your Review Activity
      </h2>
      <ReactCalendarHeatmap
        startDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
        endDate={new Date()}
        values={reviewData}
        classForValue={(value) => {
          if (!value) return "color-empty";
          return `color-scale-${Math.min(4, value.count)}`;
        }}
        tooltipDataAttrs={(value) => {
          return {
            "data-tip":
              value && value.date
                ? `${value.date}: ${value.count} reviews`
                : "No reviews",
          } as unknown as ReactCalendarHeatmap.TooltipDataAttrs;
        }}
        showWeekdayLabels
      />

      <style jsx global>{`
        .react-calendar-heatmap .color-empty {
          fill: #ebedf0;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: #9be9a8;
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: #40c463;
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: #30a14e;
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: #216e39;
        }
      `}</style>
    </div>
  );
};

export default ReviewHeatmap;
