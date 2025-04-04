import axios from "axios";

export async function tiktok(tiktokUrl) {
  return (
    await axios.get("https://tikwm.com/api", {
      params: {
        url: tiktokUrl,
        hd: 1,
      },
    })
  ).data;
}

export async function pinterest(pinterestUrl) {
  return (
    await axios.get(
      "https://pinterestdownloader.io/frontendService/DownloaderService",
      {
        params: {
          url: pinterestUrl,
        },
      },
    )
  ).data;
}

export async function pinterestV2(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/pinterestdl", {
      params: {
        url,
      },
    })
  ).data;
}

export async function twitter(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/twitterdl", {
      params: {
        url,
      },
    })
  ).data;
}

export async function xTwitterV2(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/twitterv2", {
      params: {
        url,
      },
    })
  ).data;
}

export async function instagram(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/instagram", {
      params: {
        url,
      },
    })
  ).data;
}

export async function instagramV2(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/igv2", {
      params: {
        url,
      },
    })
  ).data;
}

export async function instastory(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/igstories", {
      params: {
        url,
      },
    })
  ).data;
}

export async function mediafire(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/mediafire", {
      params: {
        url,
      },
    })
  ).data;
}

export async function ytmp3(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/ytmp3", {
      family: 4,
      params: {
        url,
      },
    })
  ).data;
}

export async function ytmp4(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/ytmp4", {
      family: 4,
      params: {
        url,
      },
    })
  ).data;
}

export async function ytmp4V2(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/ytmp4v2", {
      params: {
        url,
      },
    })
  ).data;
}

export async function spotify(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/spotifydlv3", {
      params: {
        url,
      },
    })
  ).data;
}

export async function threads(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/threads", {
      params: {
        url,
      },
    })
  ).data;
}

export async function soundcloud(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/soundcloud", {
      params: {
        url,
      },
    })
  ).data;
}

export async function github(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/gitclone", {
      params: {
        url,
      },
    })
  ).data;
}

export async function pastebin(url) {
  return (
    await axios.get("https://delirius-apiofc.vercel.app/download/pastebin", {
      params: {
        url,
      },
    })
  ).data;
}

export async function dlBuffer(url) {
  return (
    await axios.get(url, {
      family: 4,
      responseType: "arraybuffer",
    })
  ).data;
}

export default {
  tiktok,
  pinterest,
  pinterestV2,
  twitter,
  xTwitterV2,
  instagram,
  instagramV2,
  instastory,
  ytmp3,
  ytmp4,
  threads,
  soundcloud,
  github,
  pastebin,
};
