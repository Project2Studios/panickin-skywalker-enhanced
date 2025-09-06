import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudioPreviewPlayer } from '@/components/audio/audio-preview-player';
import { AudioWaveformVisualizer } from '@/components/audio/audio-waveform-visualizer';
import { BackgroundVideo, LazyBackgroundVideo } from '@/components/video/background-video';
import { Play, Music, ExternalLink, Heart, Share2, Download, Headphones, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  duration: string;
  previewUrl: string;
  spotifyUrl: string;
  youtubeUrl: string;
  appleMusicUrl: string;
  isPopular: boolean;
  lyrics?: string[];
}

interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  type: 'Album' | 'EP' | 'Single';
  coverArt: string;
  description: string;
  genre: string[];
  totalTracks: number;
  totalDuration: string;
  tracks: Track[];
  spotifyUrl: string;
  youtubeUrl: string;
  appleMusicUrl: string;
  bandcampUrl?: string;
  isNew: boolean;
  isFeatured: boolean;
  videoSrc?: string;
  videoPoster?: string;
}

const featuredAlbums: Album[] = [
  {
    id: 'my-space',
    title: 'MY SPACE',
    artist: 'Panickin\' Skywalker',
    year: '2024',
    type: 'Album',
    coverArt: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500',
    description: 'A journey through the depths of millennial consciousness, exploring the space between anxiety and hope',
    genre: ['Pop Punk', 'Alternative Rock', 'Emo'],
    totalTracks: 12,
    totalDuration: '42:15',
    spotifyUrl: 'https://open.spotify.com/album/example-my-space',
    youtubeUrl: 'https://youtube.com/playlist?list=example-my-space',
    appleMusicUrl: 'https://music.apple.com/album/example-my-space',
    bandcampUrl: 'https://panickinskywalker.bandcamp.com/album/my-space',
    isNew: true,
    isFeatured: true,
    videoSrc: 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4',
    videoPoster: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800',
    tracks: [
      {
        id: 'panic-attack',
        title: 'PANIC ATTACK',
        duration: '3:42',
        previewUrl: '/my-space.mp3',
        spotifyUrl: 'https://open.spotify.com/track/example-panic-attack',
        youtubeUrl: 'https://youtube.com/watch?v=example-panic-attack',
        appleMusicUrl: 'https://music.apple.com/song/example-panic-attack',
        isPopular: true,
        lyrics: [
          "Heart racing, mind spinning, can't catch my breath",
          "Another panic attack, dancing with death",
          "But I'm a superhero in my own mind",
          "Fighting anxiety, one day at a time"
        ]
      },
      {
        id: 'superhero-syndrome',
        title: 'SUPERHERO SYNDROME',
        duration: '4:01',
        previewUrl: 'https://www.soundjay.com/misc/bell-ringing-05.wav',
        spotifyUrl: 'https://open.spotify.com/track/example-superhero',
        youtubeUrl: 'https://youtube.com/watch?v=example-superhero',
        appleMusicUrl: 'https://music.apple.com/song/example-superhero',
        isPopular: true
      },
      {
        id: 'millennial-meltdown',
        title: 'MILLENNIAL MELTDOWN',
        duration: '3:28',
        previewUrl: 'https://www.soundjay.com/misc/bell-ringing-05.wav',
        spotifyUrl: 'https://open.spotify.com/track/example-meltdown',
        youtubeUrl: 'https://youtube.com/watch?v=example-meltdown',
        appleMusicUrl: 'https://music.apple.com/song/example-meltdown',
        isPopular: false
      }
    ]
  },
  {
    id: 'superhero-complex',
    title: 'SUPERHERO COMPLEX',
    artist: 'Panickin\' Skywalker',
    year: '2023',
    type: 'Album',
    coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
    description: 'The breakthrough album that launched a thousand anxious superhero hearts',
    genre: ['Pop Punk', 'Alternative Rock'],
    totalTracks: 10,
    totalDuration: '38:45',
    spotifyUrl: 'https://open.spotify.com/album/example-superhero-complex',
    youtubeUrl: 'https://youtube.com/playlist?list=example-superhero-complex',
    appleMusicUrl: 'https://music.apple.com/album/example-superhero-complex',
    isNew: false,
    isFeatured: false,
    tracks: [
      {
        id: 'anxiety-anthem',
        title: 'ANXIETY ANTHEM',
        duration: '3:56',
        previewUrl: 'https://www.soundjay.com/misc/bell-ringing-05.wav',
        spotifyUrl: 'https://open.spotify.com/track/example-anxiety',
        youtubeUrl: 'https://youtube.com/watch?v=example-anxiety',
        appleMusicUrl: 'https://music.apple.com/song/example-anxiety',
        isPopular: true
      }
    ]
  }
];

interface EnhancedMusicSectionProps {
  className?: string;
  showVideoBackground?: boolean;
  autoPlayAudio?: boolean;
}

export const EnhancedMusicSection: React.FC<EnhancedMusicSectionProps> = ({
  className,
  showVideoBackground = true,
  autoPlayAudio = false
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<Album>(featuredAlbums[0]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  
  const sectionRef = useRef<HTMLElement>(null);

  const handleTrackPlay = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleTrackPause = () => {
    setIsPlaying(false);
  };

  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const handleShare = async (item: Album | Track) => {
    const url = 'spotifyUrl' in item ? item.spotifyUrl : selectedAlbum.spotifyUrl;
    const title = 'title' in item ? item.title : selectedAlbum.title;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - Panickin' Skywalker`,
          text: `Check out this amazing ${item.id.includes('album') ? 'album' : 'track'} by Panickin' Skywalker!`,
          url
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="music" 
      className={cn("relative min-h-screen py-24", className)}
    >
      {/* Video Background for Featured Album */}
      {showVideoBackground && selectedAlbum.isFeatured && selectedAlbum.videoSrc && (
        <div className="absolute inset-0">
          <LazyBackgroundVideo
            videoSrc={selectedAlbum.videoSrc}
            posterImage={selectedAlbum.videoPoster || selectedAlbum.coverArt}
            overlay={true}
            overlayOpacity={0.75}
            playButton={true}
            loop={true}
            muted={true}
            className="w-full h-full"
          />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-bold tracking-wider">
              <Headphones className="w-4 h-4 mr-2" />
              LATEST RELEASES
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              MUSIC
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience our sound with interactive previews, waveform visualizations, and full streaming integration
            </p>
          </motion.div>
        </div>

        {/* Album Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {featuredAlbums.map((album, index) => (
            <motion.button
              key={album.id}
              onClick={() => handleAlbumSelect(album)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                "border border-border hover:border-primary",
                selectedAlbum.id === album.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card text-foreground hover:bg-primary/10"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {album.title}
              {album.isNew && (
                <Badge variant="destructive" className="ml-2 text-xs">NEW</Badge>
              )}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Album Showcase */}
          <motion.div
            key={selectedAlbum.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card/80 border border-border backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Album Art */}
                  <div className="relative group mx-auto md:mx-0">
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-lg overflow-hidden shadow-2xl">
                      <img 
                        src={selectedAlbum.coverArt} 
                        alt={`${selectedAlbum.title} cover art`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {selectedAlbum.isFeatured && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      )}
                    </div>
                    
                    {/* Floating play button */}
                    <motion.div
                      className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => window.open(selectedAlbum.spotifyUrl, '_blank')}
                    >
                      <Play className="w-5 h-5" />
                    </motion.div>
                  </div>

                  {/* Album Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{selectedAlbum.type}</Badge>
                        <Badge variant="outline">{selectedAlbum.year}</Badge>
                        {selectedAlbum.isNew && (
                          <Badge variant="destructive">NEW</Badge>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold mb-2 text-gradient">
                        {selectedAlbum.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {selectedAlbum.description}
                      </p>
                    </div>

                    {/* Album Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tracks:</span>
                        <span className="ml-2 font-semibold">{selectedAlbum.totalTracks}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-semibold">{selectedAlbum.totalDuration}</span>
                      </div>
                    </div>

                    {/* Genre Tags */}
                    <div className="flex flex-wrap gap-2">
                      {selectedAlbum.genre.map((genre, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>

                    {/* Streaming Links */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => window.open(selectedAlbum.spotifyUrl, '_blank')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Spotify
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(selectedAlbum.youtubeUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        YouTube
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(selectedAlbum.appleMusicUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apple Music
                      </Button>
                      
                      {/* Share Button */}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleShare(selectedAlbum)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Track List with Audio Previews */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Track Previews
              {currentTrack && (
                <Badge variant="outline" className="ml-auto">
                  Now Playing: {currentTrack.title}
                </Badge>
              )}
            </h4>

            {/* Global Waveform Visualizer */}
            <Card className="bg-card/60 border border-border backdrop-blur-sm">
              <CardContent className="p-4">
                <AudioWaveformVisualizer
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  height={80}
                  style="bars"
                  animate={true}
                  className="mb-4"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {currentTrack ? `Now Playing: ${currentTrack.title}` : 'Select a track to play preview'}
                  </span>
                  {isPlaying && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center gap-1"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>LIVE</span>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Track List */}
            <div className="space-y-3">
              {selectedAlbum.tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AudioPreviewPlayer
                    trackId={track.id}
                    title={track.title}
                    artist={selectedAlbum.artist}
                    albumArt={selectedAlbum.coverArt}
                    previewUrl={track.previewUrl}
                    spotifyUrl={track.spotifyUrl}
                    youtubeUrl={track.youtubeUrl}
                    size="md"
                    autoPlay={autoPlayAudio && index === 0}
                    onPlay={() => handleTrackPlay(track)}
                    onPause={handleTrackPause}
                    className={cn(
                      "transition-all duration-300",
                      track.isPopular && "ring-2 ring-primary/20",
                      currentTrack?.id === track.id && "bg-primary/5 border-primary/30"
                    )}
                  />
                  
                  {/* Track Actions */}
                  <div className="flex items-center gap-2 mt-2 ml-20">
                    {track.isPopular && (
                      <Badge variant="outline" className="text-xs">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Popular
                      </Badge>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleShare(track)}
                      className="text-xs h-6 px-2"
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <CardContent className="p-6 text-center">
                <h5 className="font-bold mb-2">Want the Full Experience?</h5>
                <p className="text-sm text-muted-foreground mb-4">
                  Stream the complete album with high-quality audio and lyrics
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" onClick={() => window.open(selectedAlbum.spotifyUrl, '_blank')}>
                    Full Album on Spotify
                  </Button>
                  {selectedAlbum.bandcampUrl && (
                    <Button size="sm" variant="outline" onClick={() => window.open(selectedAlbum.bandcampUrl, '_blank')}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedMusicSection;