'use client';

import { Fragment, PropsWithChildren, useCallback, useState } from "react";
import Image from "next/image";
import Scrollbars from "react-custom-scrollbars-2";
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import profileSelect from '~/assets/images/profile-select.webp';
import { Modal } from "~/components/Modal";

import { AccentIconFrame } from "~/components/AccentIconFrame";
import { PROFILES } from "~/constants";
import { Button } from "../Button";

import styles from './ProfileSelectModal.module.css';

interface ProfileSelectModalProps {
  defaultOpen?: boolean;
  onConfirm?: (profileId: string) => void;
}

function resetProfileSelection() {
  return PROFILES.find(p => p.id === 'default')!;
}

function getProfiles() {
  return PROFILES.filter(p => p.id !== 'default');
}

export function ProfileSelectModal({
  children,
  defaultOpen = false,
  onConfirm,
}: PropsWithChildren<ProfileSelectModalProps>) {
  const [isOpenModal, setIsOpenModal] = useState(defaultOpen);
  const [selectedProfile, selectProfile] = useState(resetProfileSelection());

  const handleClose = useCallback(() => {
    setIsOpenModal(false);
    selectProfile(resetProfileSelection());
  }, []);

  const handleConfirm = useCallback((profileId: string) => {
    if (onConfirm) {
      onConfirm(profileId);
    }
    handleClose();
  }, [handleClose, onConfirm]);

  return (
    <>
      <div
        className={styles.trigger}
        onClick={() => setIsOpenModal(true)}
      >
        {children}
      </div>
      <Modal isOpen={isOpenModal}>
        <div className={styles.content}>
          <div className={styles.info}>
            <Image
              className={styles.image}
              src={profileSelect}
              alt="Profile select"
              width={320}
              quality={90}
            />
            <div className={styles.infoOverlay}>
              <div className={styles.infoContent}>
                <Image
                  className={styles.selectedImage}
                  src={selectedProfile.image}
                  alt={selectedProfile.title}
                  width={150}
                  height={150}
                  quality={90}
                />
                <div className={styles.selectedTitle}>{selectedProfile.title}</div>
              </div>
            </div>
          </div>

          <div className={styles.profilesWrapper}>
            <div className={styles.profilesTitle}>Выбор персонажа</div>
            <div className={styles.scrollWrapper}>
              <Scrollbars
                universal={false}
                autoHide={false}
                autoHeight
                autoHeightMax={500}
                autoHeightMin={400}
                renderThumbHorizontal={() => <div />}
                renderTrackHorizontal={() => <div />}
                renderTrackVertical={() => <div className={styles.scrollbarTrack} />}
                renderThumbVertical={() => <div className={styles.scrollbarThumb} />}
              >
                <div className={styles.profiles}>
                  {getProfiles().map(profile => (
                    <div
                      key={profile.id}
                      className={styles.profile}
                      onClick={() => selectProfile(profile)}
                    >
                      <Image
                        className={styles.profileImage}
                        src={profile.image}
                        alt={profile.title}
                        width={120}
                        height={120}
                        quality={90}
                      />
                    </div>
                  ))}
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            onClick={handleClose}
            className={styles.actionButton}
            icon={
              <AccentIconFrame>
                <IoClose style={{ fontSize: '1.9rem' }} />
              </AccentIconFrame>
            }
          >
            Отменить
          </Button>
          <Button
            onClick={() => handleConfirm(selectedProfile.id)}
            className={styles.actionButton}
            disabled={selectedProfile.id === 'default'}
            icon={
              <AccentIconFrame>
                <FaCheck />
              </AccentIconFrame>
            }
          >
            Подтвердить
          </Button>
        </div>
      </Modal>
    </>
  );
}