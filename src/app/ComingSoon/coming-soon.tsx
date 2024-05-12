export default function ComingSoon(){
    return(
    <div className="relative overflow-y-hidden h-[80vh] w-full flex items-center justify-center bg-cover bg-center text-center px-5">
      <div className="flex flex-col justify-center text-black dark:text-white w-full h-screen">
        <h1 className="text-5xl">We are <b>Almost</b> there!</h1>
        <p>Stay tuned for something amazing!!!</p>

        <div className="mt-10 mb-5">
          <div className="shadow w-full bg-gray-300 mt-2 max-w-2xl mx-auto rounded-full">
            <div className="rounded-full bg-indigo-600 text-xs leading-none text-center text-white py-1" style={{width: '75%'}}>75%</div>
          </div>
        </div>
      </div>
    </div>
    )
}