import InterviewCard from "@/components/InterviewCard"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/actions/auth.action"
import { getInterviewByUserId, getLatestInterview } from "@/lib/actions/general.action";
import Image from "next/image"
import Link from "next/link"

const Page = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <section className="card-cta">
          <div className="flex flex-col gap-6 max-w-lg">
            <h2>Get Interview-Ready with AI-Practice & Feedback</h2>
            <p className="text-lg">Practice on real interview questions & get instant feedback</p>
            <Button className="btn-primary max-sm:w-full">
              <Link href="/interview">Start Interview</Link>
            </Button>
          </div>
          <Image src="/robot.png" alt="robot-hero" width={400} height={400} className="max-sm:hidden" />
        </section>
      </>
    )
  }

  const [userInterviews, latestInterviews] = await Promise.all([
    await getInterviewByUserId(user.id),
    await getLatestInterview({ userId: user.id })
  ])

  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterview = (latestInterviews?.length ?? 0) > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Practice & Feedback</h2>
          <p className="text-lg">Practice on real interview questions & get instant feedback</p>
          <Button className="btn-primary max-sm:w-full">
            <Link href="/interview">Start Interview</Link>
          </Button>
        </div>
        <Image src="/robot.png" alt="robot-hero" width={400} height={400} className="max-sm:hidden" />
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard key={interview.id} {...interview} currentUserId={user.id} />
            ))) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        <div className="interviews-section">
          {hasUpcomingInterview ? (
            latestInterviews?.map((interview) => (
              <InterviewCard key={interview.id} {...interview} currentUserId={user.id} />
            ))) : (
            <p>There no new interview available. Sorry!</p>
          )}
        </div>
      </section>
    </>

  )
}

export default Page