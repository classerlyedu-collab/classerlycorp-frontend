import { TiStar } from "react-icons/ti";
import { Container, Progress } from "rsuite";

type Counts = { [k: string]: number };

interface TeacherRatingProps {
    counts: Counts;      // { "1": number, ..., "5": number }
    average: number;     // average 0..5
    total: number;       // total number of reviews
}

const TeacherRating = ({ counts, average, total }: TeacherRatingProps) => {
    const c1 = Number(counts["1"] || 0);
    const c2 = Number(counts["2"] || 0);
    const c3 = Number(counts["3"] || 0);
    const c4 = Number(counts["4"] || 0);
    const c5 = Number(counts["5"] || 0);
    const tot = Number.isFinite(total) && total > 0 ? total : (c1 + c2 + c3 + c4 + c5);

    const toPercent = (count: number) => tot > 0 ? Math.round((count / tot) * 100) : 0;

    const ratings = [
        { stars: '5 Stars', percentage: toPercent(c5) },
        { stars: '4 Stars', percentage: toPercent(c4) },
        { stars: '3 Stars', percentage: toPercent(c3) },
        { stars: '2 Stars', percentage: toPercent(c2) },
        { stars: '1 Star', percentage: toPercent(c1) },
    ];

    const avgDisplay = Number.isFinite(average) ? average.toFixed(1) : 'N/A';

    return (
        <div className="bg-white flex flex-col justify-center items-center rounded-2xl pt-4" >
            <div className="flex justify-center items-center border-b border-greyBlack w-11/12">
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2 md:mb-2">Your Profile Ratings</h1>
            </div>

            <div className="flex flex-row justify-center items-center flex-wrap rounded-full bg-[#F5F8FF] w-11/12 mt-4 py-3">
                <TiStar className="text-yellow-300 text-3xl" />
                <TiStar className="text-yellow-300 text-3xl" />
                <TiStar className="text-yellow-300 text-3xl" />
                <TiStar className="text-yellow-300 text-3xl" />
                <TiStar className="text-yellow-200 text-3xl" />
                <h3 className="font-ubuntu font-medium text-sm text-greyBlack">{avgDisplay} out of 5</h3>
            </div>

            <h1 className="font-ubuntu font-medium text-xs md:text-sm text-greyBlack mb-2 md:mb-2 pt-2">{tot}+ Students Reviews</h1>

            <div className="w-full px-3 pb-3">
                {ratings.map((items) => (
                    <div key={items.stars} className="flex flex-row justify-between w-full items-center mb-2 flex-wrap">
                        <h3 className="font-ubuntu font-medium text-xs text-[#0674F8]">{items.stars}</h3>
                        <Container>
                            <Progress.Line
                                percent={items.percentage}
                                strokeColor="#13D360"
                                color="#E7FBEF"
                                strokeWidth={12}
                                trailColor="#E7FBEF"
                            />
                        </Container>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default TeacherRating