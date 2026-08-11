type ChevronIconProps = {
  className?: string;
};

function ChevronIcon({ className = '' }: ChevronIconProps) {
  return (
    <svg className={className} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.71139 -4.76837e-06L9.42285 4.71145L8.64889 5.48541L4.71139 1.54791L0.773893 5.48541L-6.58035e-05 4.71145L4.71139 -4.76837e-06Z" fill="currentColor" />
    </svg>
  );
}

export { ChevronIcon };
