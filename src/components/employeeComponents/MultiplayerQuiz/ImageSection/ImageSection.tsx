import { quizQuestionsData } from "../../../../constants/employee/Quiz";

const ImageSection = () => {

    return (
        <div className="w-full rounded-2xl flex flex-row justify-around items-start sm:items-center">

            {/* student */}
            <div className="w-[10rem] sm:w-40 md:w-52 2xl:w-64" >
                <h1 className="sm:hidden font-ubuntu font-medium text-sm mb-2 text-orange-400 sm:self-start">Ralph Edwar</h1>

                <img
                    className="w-full"
                    src="https://s3-alpha-sig.figma.com/img/42d5/055b/e1f6925068dced36e436a53527255942?Expires=1723420800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=StpCF61o07h2mNDB19l8DkJ~qyIo~o9kGta716Uzx9X3Qc~OoR1dfh6SEvd6PUmF9zM86uyWcN34GR31aIP7mb17LEgMFnkmxaWGLUrraYkWAcQ4H~8lPSOSV0vCdLvFFOM4LCafqudoJqwDxniBV58bXKbXKL8ToqfWLHe8TkSJviF1U6-ZVClJ50HVIVdr8EyTQYTDSnNg9l-o8N1Pxs-KmtlFP-n2KjoBDT2SiNEKuDxPM3XTuHDfQJTnOQZL~8P10aKoLttchPh0FgFn~b6rfBOpwQ7gvZ65Dfs2U6UVlUkBLJheEqJPNlGCnYOaLXsrat3epjV6tmE1BWTNmQ__"
                    alt="Ralph Edwar"
                />

                {/* decision & answers */}
                <div className="flex flex-col gap-5 items-center justify-center w-full" >

                    <div className="grid grid-cols-2 mt-3 gap-3 md:gap-5 w-full flex-row items-center justify-between" >

                        <div className="col-span-2 sm:col-span-1 bg-[#13D360] py-2 px-3 rounded-full flex items-center justify-center" >
                            <h6 className="text-xs sm:text-sm md:text-base font-semibold text-white" >Right</h6>
                        </div>

                        <div className="col-span-2 sm:col-span-1 bg-red-500 py-2 px-3 rounded-full flex items-center justify-center opacity-40" >
                            <h6 className="text-xs sm:text-sm md:text-base font-semibold text-white" >Wrong</h6>
                        </div>

                    </div>

                    {/* dots */}
                    <div className="flex flex-row items-center justify-around gap-3 w-full" >
                        {
                            Array.from({ length: quizQuestionsData?.length / 2 })?.map((_, index) => (
                                <div className="first:bg-[#13D360] h-2 sm:h-4 w-2 sm:w-4 rounded-full bg-gray-200" />
                            ))
                        }
                    </div>
                    {/* dots */}
                    <div className="flex flex-row items-center justify-around gap-3 w-full" >
                        {
                            Array.from({ length: quizQuestionsData?.length / 2 })?.map((_, index) => (
                                <div className="h-2 sm:h-4 w-2 sm:w-4 rounded-full bg-gray-200" />
                            ))
                        }
                    </div>

                </div>


            </div>

            {/* text */}
            <div className="flex flex-col gap-3 md:gap-5 sm:w-40 md:w-52 2xl:w-64 " >
                <h1 className="hidden sm:flex font-ubuntu font-medium text-base md:text-2xl text-orange-400 sm:self-start">Ralph Edwar</h1>
                <h1 className="font-ubuntu font-semibold text-lg mb-2 sm:mb-0 sm:text-5xl md:text-6xl text-orange-600 sm:self-center">VS</h1>
                <h1 className="hidden sm:flex font-ubuntu font-medium text-base md:text-2xl text-orange-400 sm:self-end">Jacob Jones</h1>
            </div>

            {/* competetor */}
            <div className="w-[10rem] sm:w-40 md:w-52 2xl:w-64" >
                <h1 className="sm:hidden font-ubuntu font-medium text-end text-sm mb-2 text-orange-400 sm:self-start">Jacob Jones</h1>

                <img
                    className="w-full"
                    src="https://s3-alpha-sig.figma.com/img/c13c/1e24/1e6baeeb9f8d7582f9d06e78b4720cca?Expires=1723420800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Tjf6UeXhCCiSCTDkAKbiX9Bi~k4qvmBSOhBCI0j6dRE5nH6zawI8sNsqMLQdq5G4A1mgOdmqequtvKSDgR025ehwh03rGCOUKvQHRx22BKTa9ylwV0faqGfUfMFfafV8wEZfnMa1oUjQuAmELqlE-~qpsWnK1hVVCHRDdt7MoQablytPQCZKcNz6-~ujAbRBqJWYFlNOSiWNv6dJHIr-OsnfNv5tMO3KXdrW2qMe~BHulfusjul11vtIM-u7gN7hutIOGY5ufVn9CA6fffIL6llOpyvSVpprkahMyaRl0hzRVy4ungVvD0F47wKdxlOxBQyE7OFWCvv-v7xyhwcG0A__"
                    alt="Jacob Jones" />

                {/* decision & answers */}
                <div className="flex flex-col gap-5 items-center justify-center w-full" >

                    <div className="grid grid-cols-2 mt-3 gap-3 md:gap-5 w-full flex-row items-center justify-between" >

                        <div className="col-span-2 sm:col-span-1 bg-[#13D360] py-2 px-3 rounded-full flex items-center justify-center" >
                            <h6 className="text-xs sm:text-sm md:text-base font-semibold text-white" >Right</h6>
                        </div>

                        <div className="col-span-2 sm:col-span-1 bg-red-500 py-2 px-3 rounded-full flex items-center justify-center opacity-40" >
                            <h6 className="text-xs sm:text-sm md:text-base font-semibold text-white" >Wrong</h6>
                        </div>

                    </div>

                    {/* dots */}
                    <div className="flex flex-row items-center justify-around gap-3 w-full" >
                        {
                            Array.from({ length: quizQuestionsData?.length / 2 })?.map((_, index) => (
                                <div className="first:bg-[#13D360] h-2 sm:h-4 w-2 sm:w-4 rounded-full bg-gray-200" />
                            ))
                        }
                    </div>
                    {/* dots */}
                    <div className="flex flex-row items-center justify-around gap-3 w-full" >
                        {
                            Array.from({ length: quizQuestionsData?.length / 2 })?.map((_, index) => (
                                <div className="h-2 sm:h-4 w-2 sm:w-4 rounded-full bg-gray-200" />
                            ))
                        }
                    </div>

                </div>

            </div>

        </div>
    )
}
export default ImageSection;