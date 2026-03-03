const oldStructureRegex = /^https:\/\/raw.githubusercontent\.com\/Gimloader\/client-plugins\/(?:refs\/heads\/)?main\/(plugins|libraries)(?:\/\w+\/build)?\/(\w+\.js)$/g;
const oldRepoRegex = /^https:\/\/raw.githubusercontent\.com\/Gimloader\/client-plugins\/(?:refs\/heads\/)?main\/build\/(plugins|libraries)\/(\w+\.js)$/g;

export function formatDownloadUrl(url: string) {
    // migrate from TheLazySquid/Gimloader -> Gimloader/client-plugins
    url = url.replace("https://raw.githubusercontent.com/TheLazySquid/Gimloader", "https://raw.githubusercontent.com/Gimloader/client-plugins");

    // migrate structure of client-plugins repo
    url = url.replace(oldStructureRegex, "https://raw.githubusercontent.com/Gimloader/builds/main/$1/$2");

    // migrate from client-plugins to builds repo
    url = url.replace(oldRepoRegex, "https://raw.githubusercontent.com/Gimloader/builds/main/$1/$2");

    return url;
}
