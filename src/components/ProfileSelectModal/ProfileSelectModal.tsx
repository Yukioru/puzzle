"use client";

import { PropsWithChildren, useCallback, useState } from "react";
import Image from "next/image";
import Scrollbars from "react-custom-scrollbars-2";
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import profileSelect from "~/assets/images/profile-select.webp";
import { Modal } from "~/components/Modal";

import { AccentIconFrame } from "~/components/AccentIconFrame";
import { PROFILES } from "~/constants";
import { Button } from "../Button";

import styles from "./ProfileSelectModal.module.css";
import clsx from "clsx";

interface ProfileSelectModalProps {
  defaultOpen?: boolean;
  onConfirm?: (profileId: string) => void;
}

function resetProfileSelection() {
  return PROFILES.find((p) => p.id === "default")!;
}

function getProfiles() {
  return PROFILES.filter((p) => p.id !== "default");
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
    setTimeout(() => {
      selectProfile(resetProfileSelection());
    }, 400);
  }, []);

  const handleConfirm = useCallback(
    (profileId: string) => {
      if (onConfirm) {
        onConfirm(profileId);
      }
      handleClose();
    },
    [handleClose, onConfirm]
  );

  return (
    <>
      <div className={styles.trigger} onClick={() => setIsOpenModal(true)}>
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
                <div className={styles.selectedTitle}>
                  {selectedProfile.title}
                </div>
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
                renderTrackVertical={() => (
                  <div className={styles.scrollbarTrack} />
                )}
                renderThumbVertical={() => (
                  <div className={styles.scrollbarThumb} />
                )}
              >
                <div className={styles.profiles}>
                  {getProfiles().map((profile) => {
                    const isSelected = profile.id === selectedProfile.id;
                    return (
                      <div
                        key={profile.id}
                        className={clsx(styles.profile, {
                          [styles.selected]: isSelected,
                        })}
                        onClick={() => selectProfile(profile)}
                      >
                        {isSelected && (
                          <>
                            <div className={styles.selectedMark}>
                              <svg
                                width="1em"
                                height="1em"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 47 50"
                              >
                                <path
                                  fillRule="evenodd"
                                  fill="#262626"
                                  stroke="white"
                                  strokeWidth="2"
                                  d="M23 44 4 17h8l11 15 10-15h8L23 44Zm-8-28 8-12 7 12-7 11-8-11Z"
                                />
                              </svg>
                            </div>
                            <div className={styles.selectedOverlay}>
                              <div
                                className={clsx(
                                  styles.selectedOverlayDot,
                                  styles.selectedOverlayTop
                                )}
                              />
                              <div
                                className={clsx(
                                  styles.selectedOverlayDot,
                                  styles.selectedOverlayBottom
                                )}
                              />
                            </div>
                          </>
                        )}
                        <Image
                          className={styles.profileImage}
                          src={profile.image}
                          alt={profile.title}
                          width={130}
                          height={130}
                          quality={90}
                        />
                      </div>
                    );
                  })}
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
                <IoClose style={{ fontSize: "1.9rem" }} />
              </AccentIconFrame>
            }
          >
            Отменить
          </Button>
          <Button
            onClick={() => handleConfirm(selectedProfile.id)}
            className={styles.actionButton}
            disabled={selectedProfile.id === "default"}
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
