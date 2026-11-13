// Single place to edit contact + social details used across the site.
export const SITE = {
  name: 'Blockwise Tech Blog',
  email: 'sujithvenkatesen@gmail.com',
  socials: [
    { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/sujith-venkatesan03' },
    { key: 'github', label: 'GitHub', href: 'https://github.com/sujithvenkatesen' },
    { key: 'youtube', label: 'YouTube', href: 'https://youtube.com/@sujithv-wn9iw' },
    { key: 'threads', label: 'Threads', href: 'https://www.threads.com/@b_.cooll' },
  ],
};

export const SAME_AS = SITE.socials.map((s) => s.href);
