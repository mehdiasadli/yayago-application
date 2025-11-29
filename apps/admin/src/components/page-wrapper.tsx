import { cn } from '@/lib/utils';
import PageHeader from './page-header';
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from './ui/frame';

interface PageWrapperProps {
  title: string;
  description?: string;
  header?: React.ReactNode;
  children: React.ReactNode;

  // classNames
  frameClassName?: string;
  frameHeaderClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  pageHeaderClassname?: string;
  buttonsContainerClassName?: string;
  panelClassName?: string;
}

export default function PageWrapper({
  title,
  description,
  header,
  children,
  frameClassName,
  frameHeaderClassName,
  titleClassName,
  descriptionClassName,
  pageHeaderClassname,
  buttonsContainerClassName,
  panelClassName,
}: PageWrapperProps) {
  return (
    <Frame className={cn('space-y-4', frameClassName)}>
      <FrameHeader className={frameHeaderClassName}>
        <PageHeader
          className={pageHeaderClassname}
          title={<FrameTitle className={cn('text-2xl font-bold', titleClassName)}>{title}</FrameTitle>}
          description={
            description ? (
              <FrameDescription className={cn('text-md text-muted-foreground', descriptionClassName)}>
                {description}
              </FrameDescription>
            ) : undefined
          }
        >
          <div className={cn('flex items-center gap-2', buttonsContainerClassName)}>{header}</div>
        </PageHeader>
      </FrameHeader>
      <FramePanel className={panelClassName}>{children}</FramePanel>
    </Frame>
  );
}
