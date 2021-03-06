import React, { useState, useEffect } from 'react';
import { Link, navigate } from 'gatsby';
import styles from './helper-widget.module.scss';
// icons
import OpenIcon from './svg/open.inline.svg';
import CloseIcon from './svg/close.inline.svg';
import Slack from './svg/slack.inline.svg';
import Cloud from './svg/cloud.inline.svg';
import Message from './svg/message.inline.svg';

const CHAT_ONLY_PATHS = [
  '/cloud',
  '/cloud/',
  '/docs/cloud',
  '/docs/cloud/',
  '/pricing',
  '/pricing/',
];

const HelperWidget = props => {
  // states
  const [shouldRender, setShouldRender] = useState(false);
  const [driftReady, setDriftReady] = useState(false);
  const [defaultWidgetIsOpen, setDefaultWidgetIsOpen] = useState(false);

  const widgetClickOutside = e => {
    const widget = document.getElementById('custom-drift-widget-container');
    if (!widget.contains(e.target)) {
      setDefaultWidgetIsOpen(false);
      document.removeEventListener('click', widgetClickOutside);
    }
  };

  useEffect(() => {
    // checking if drift obj is presented at all
    if (typeof window.drift !== 'undefined') {
      // try to send an opaque get request to drift api
      fetch('https://js.driftt.com/', { mode: 'no-cors' })
        .then(res => {
          // if successfull (endpoint is not blocked by ad blocker)
          // use native drift listener
          window.drift.on('ready', api => {
            setDriftReady(true);
            setShouldRender(true);
          });
        })
        .catch(err => {
          // else just render without setting drifReady flag
          setShouldRender(true);
        });
    }
  }, [shouldRender]);

  const handleCloudClick = () => {
    if (driftReady) {
      window.drift.api.sidebar.open();
      setDefaultWidgetIsOpen(false);
      document.removeEventListener('click', widgetClickOutside);
    } else {
      navigate('/contact');
    }
  };
  // handlers
  const handleOpenClick = () => {
    const showChatOnly = CHAT_ONLY_PATHS.some(path =>
      window.location.pathname.includes(path),
    );
    if (showChatOnly) {
      handleCloudClick();
    } else {
      setDefaultWidgetIsOpen(true);
      document.addEventListener('click', widgetClickOutside);
    }
  };
  const handleCloseClick = () => {
    if (defaultWidgetIsOpen) {
      setDefaultWidgetIsOpen(false);
      document.removeEventListener('click', widgetClickOutside);
    }
  };
  return shouldRender ? (
    <div className={styles.wrapper} id={'custom-drift-widget-container'}>
      <div className={styles.menuWrapper}>
        {!defaultWidgetIsOpen && (
          <button
            className={styles.button}
            type={'button'}
            onClick={handleOpenClick}
          >
            <OpenIcon />
          </button>
        )}
        {defaultWidgetIsOpen && (
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <p className={styles.title}>Have a question?</p>
            </li>
            <li className={styles.listItem}>
              <a href={'https://community.k6.io/'}>
                <Message />
                Community forum
              </a>
            </li>
            <li className={styles.listItem}>
              <a href={'https://k6.io/slack'}>
                <Slack />
                Community Slack
              </a>
            </li>
            <li className={styles.listItem}>
              <button type={'button'} onClick={handleCloudClick}>
                <Cloud />
                Cloud support chat
              </button>
            </li>
          </ul>
        )}
        {defaultWidgetIsOpen && (
          <button
            className={styles.button}
            type={'button'}
            onClick={handleCloseClick}
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </div>
  ) : null;
};

export default HelperWidget;
