"use client";

import { PropsWithChildren, ReactNode } from "react";
import Image, { StaticImageData } from "next/image";
import Scrollbars from "react-custom-scrollbars-2";
import profileSelect from "~/assets/images/profile-select.webp";
import { Modal } from "~/components/Modal";

import styles from "./ProfileModalLayout.module.css";

export interface ProfileModalProfile {
  title: string;
  image: StaticImageData;
}

interface ProfileModalLayoutProps {
  isOpen: boolean;
  profile: ProfileModalProfile;
  title: ReactNode;
  footer?: ReactNode;
  onRequestClose?: () => void;
  withScroll?: boolean;
}

export function ProfileModalLayout({
  children,
  isOpen,
  profile,
  title,
  footer,
  onRequestClose,
  withScroll = false,
}: PropsWithChildren<ProfileModalLayoutProps>) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className={styles.content}>
        <div className={styles.info}>
          <Image
            className={styles.image}
            src={profileSelect}
            alt="Profile"
            width={320}
            quality={90}
          />
          <div className={styles.infoOverlay}>
            <div className={styles.infoContent}>
              <Image
                className={styles.selectedImage}
                src={profile.image}
                alt={profile.title}
                width={150}
                height={150}
                quality={90}
              />
              <div className={styles.selectedTitle}>
                {profile.title}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.title}>{title}</div>
          {withScroll ? (
            <div className={styles.scrollWrapper}>
              <Scrollbars
                universal={false}
                autoHide={false}
                autoHeight
                autoHeightMax={500}
                autoHeightMin={400}
                renderThumbHorizontal={() => <div />}
                renderTrackHorizontal={() => <div />}
              >
                {children}
              </Scrollbars>
            </div>
          ) : (
            <div className={styles.contentWrapper}>
              {children}
            </div>
          )}
        </div>
      </div>

      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </Modal>
  );
}
