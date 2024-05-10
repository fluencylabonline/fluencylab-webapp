export default function DicasParaAulas(){
    return(
        <div className="w-[74rem] flex flex-col gap-3 items-start overflow-y-scroll h-[75vh] bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 rounded-md">
            <div>
                <p>Ingles</p>
                <div>folder one</div>

                {/*FOLDER SYSTEM WITH DOCUMENTS, PICTURES, AUDIOS AND SO ON STORED IN THE DATABASE
                BUT THE VIDEOS I'LL STORE IN MY GOOGLE DRIVE AND LINK THEM AS IF THEY WERE FILES
                IN THE FOLDERS, SO I'LL STORE JUST THE LINK WITH A TITLE AS A FILE IN A SPECIFIC FOLDER.
                MAKE IT POSSIBLE FOR ADMINS TO UPLOAD AND DELETE FOLDERS AND FILES, AND TEACHERS CAN ONLY 
                SEE AND DOWNLOAD THEM */}
            </div>
        </div>
    );
}