import { getRandomInterviewCover } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import DisplayTechIcons from "./DisplayTechIcons";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({ id, userId, role, type, techstack, createdAt, currentUserId }: InterviewCardProps) => {
  const isOwnInterview = currentUserId === userId;
  const feedback = isOwnInterview && userId && id ?
    await getFeedbackByInterviewId({ interviewId: id, userId }) : null;
  const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
  const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');
  return (
    <div className="card-border w-90 max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
            <p className="badge-text">{normalizedType}</p>
          </div>
          <Image src={getRandomInterviewCover()} alt="cover" width={90} height={90} className="rounded-full object-fit size-22.5" />
          <h3 className="mt-5 capitalize">
            {role} Interview
          </h3>
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image src="/calendar.svg" alt="calendar" width={21} height={21} />
              <p>{formattedDate}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" alt="star" width={21} height={21} />
              <p>{isOwnInterview && feedback ? feedback.totalScore : '---'} / 100</p>
            </div>
          </div>
          <p className="line-clamp-2 mt-5">
            {isOwnInterview && feedback ? feedback.finalAssessment : "Take this interview to generate your own feedback"}
          </p>
        </div>
        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />
          <Button className="btn-primary">
            <Link href={isOwnInterview && feedback ? `/interview/${id}/feedback` : `/interview/${id}`}>
              {isOwnInterview && feedback ? "Check Feedback" : "Take Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard