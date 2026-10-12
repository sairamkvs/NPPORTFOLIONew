# Cansora Frames portfolio

Includes a responsive light editorial website, masonry photo gallery, category filters, lazy loading, fullscreen photo viewer, 10-film grid and a two-page digital book.

## Connect the media
The gallery includes 83 photos in `media/photos/` and ten local poster images in `media/posters/`. The ten MP4 files are in `media/videos/` and tracked with Git LFS. Film cards play these files inline; videos are not loaded from Google Drive.

Example:
```json
{
  "photos": [
    {"src":"media/photos/01.png","title":"Album Page 01"}
  ],
  "films": [
    {"title":"Film 01","src":"media/videos/FPV.mp4","poster":"media/posters/film-01.jpg"}
  ]
}
```
Keep each video filename aligned with its `src` in `media.json`. Use a cover image at `media/cover.svg` or replace it with your cover.

## Performance
For faster loading, optimize large photos to WebP/JPEG, roughly 1800–2200 px on the long edge and ideally 200–500 KB each. Keep video files tracked with Git LFS.

## Free publishing with GitHub + Vercel
1. Create a GitHub repository and upload the contents of this folder.
2. Open https://vercel.com/new and import that GitHub repository.
3. Choose Framework Preset `Other`, leave Build Command blank, set Output Directory to `.` and deploy.
4. Share the generated public `vercel.app` link.
A public site means anyone with the link can view/copy accessible media.
