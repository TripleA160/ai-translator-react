import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useGemini } from "../features/gemini/useGemini";
import { formatFirebaseError } from "../utils/firebase-utils";
import SwitchButton from "./SwitchButton";
import { AIError } from "firebase/ai";
import { debounce } from "lodash";
import LanguageSelector from "./LanguageSelector";
import { languages, type Language } from "../utils/language-utils";
import SaveButton from "./SaveButton";
import { useFirestore } from "../features/firestore/useFirestore";
import { useAuth } from "../features/auth/useAuth";

type Props = {
  selectedTranslation?: {
    id: string;
    sourceText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
  } | null;
  setSelectedTranslation: React.Dispatch<
    React.SetStateAction<{
      id: string;
      sourceText: string;
      translatedText: string;
      sourceLanguage: string;
      targetLanguage: string;
    } | null>
  >;
};

const Translator = ({ selectedTranslation, setSelectedTranslation }: Props) => {
  const translateInputRef = useRef<HTMLTextAreaElement>(null);
  const translateOutputRef = useRef<HTMLDivElement>(null);
  const delay = useRef<number>(750);
  const shouldUpdateTranslation = useRef<boolean>(true);
  const isTranslationSaved = useRef<boolean>(false);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const [sourceLanguage, setSourceLanguage] = useState<Language>(languages[1]);
  const [targetLanguage, setTargetLanguage] = useState<Language>(languages[0]);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { translate } = useGemini();
  const { currentUser } = useAuth();

  const {
    initialTranslationHistory,
    translationHistory,
    savedTranslations,
    addTranslationToUserSaved,
    deleteTranslationFromUserSaved,
  } = useFirestore();

  const updateTranslation = useCallback(
    async (text: string) => {
      isTranslationSaved.current = false;
      if (!shouldUpdateTranslation.current || !text || text.length === 0) {
        setTranslatedText("");
        setLoading(false);
        console.error(
          `returned from updateTranslation()\nshouldUpdateTranslation = ${shouldUpdateTranslation.current}\ntext = ${text}`,
        );
        return;
      }

      setLoading(true);

      try {
        const result = await translate(
          text,
          targetLanguage.name,
          sourceLanguage.name,
        );
        if (result) {
          setError(null);
          setTranslatedText(result);
        }
      } catch (error) {
        if (
          error instanceof AIError &&
          (error.message.includes("You exceeded your current quota") ||
            error.code.includes("429"))
        ) {
          setError("Rate limit reached, please try again later.");
        } else {
          setError(formatFirebaseError(error));
        }
      } finally {
        setLoading(false);
      }
    },
    [sourceLanguage, targetLanguage, translate],
  );

  const updateTranslationRef = useRef(updateTranslation);

  const updateTranslationWithDelay = useMemo(
    () =>
      debounce(async (text: string) => {
        await updateTranslationRef.current(text);
      }, delay.current),
    [delay],
  );

  useEffect(() => {
    updateTranslationRef.current = updateTranslation;
  }, [updateTranslation]);

  useEffect(() => {
    if (!shouldUpdateTranslation.current) return;
    updateTranslationWithDelay(translateInputRef.current!.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLanguage, targetLanguage]);

  useEffect(() => {
    if (selectedTranslation) {
      shouldUpdateTranslation.current = false;
      console.log(selectedTranslation);
      const sourceLang = languages.find(
        (lang) =>
          lang.name === selectedTranslation.sourceLanguage ||
          lang.code === selectedTranslation.sourceLanguage,
      );
      const targetLang = languages.find(
        (lang) =>
          lang.name === selectedTranslation.targetLanguage ||
          lang.code === selectedTranslation.targetLanguage,
      );
      if (sourceLang) setSourceLanguage(sourceLang);
      if (targetLang) setTargetLanguage(targetLang);
      if (translateInputRef.current)
        translateInputRef.current.value = selectedTranslation.sourceText;
      setTranslatedText(selectedTranslation.translatedText);
      isTranslationSaved.current = savedTranslations?.find(
        (translation) => translation.id === selectedTranslation.id,
      )
        ? true
        : false;
      setTimeout(() => {
        shouldUpdateTranslation.current = true;
      }, delay.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTranslation]);

  useEffect(() => {
    if (
      !translationHistory ||
      !initialTranslationHistory ||
      translationHistory.length <= initialTranslationHistory.length
    ) {
      return;
    }

    const recent = translationHistory[0];
    setSelectedTranslation({
      id: recent.id,
      sourceText: recent.sourceText,
      translatedText: recent.translatedText,
      sourceLanguage: recent.sourceLanguage,
      targetLanguage: recent.targetLanguage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationHistory, initialTranslationHistory]);

  useEffect(() => {
    if (!currentUser) {
      if (translateInputRef.current) translateInputRef.current.value = "";
      if (translatedText) setTranslatedText(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    return () => {
      updateTranslationWithDelay.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    updateTranslationWithDelay(e.target.value);
  };

  const handleSwitch = () => {
    if (translatedText) translateInputRef.current!.value = translatedText;
    const langTemp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(langTemp);

    translateInputRef.current?.focus();
  };

  const handleSave = () => {
    if (!selectedTranslation) return;

    if (isTranslationSaved.current) {
      deleteTranslationFromUserSaved(selectedTranslation.id);
      isTranslationSaved.current = false;
    } else {
      addTranslationToUserSaved({
        id: selectedTranslation.id,
        sourceText: selectedTranslation.sourceText,
        translatedText: selectedTranslation.translatedText,
        sourceLanguage: selectedTranslation.sourceLanguage,
        targetLanguage: selectedTranslation.targetLanguage,
      });
      translateInputRef.current?.focus();
      isTranslationSaved.current = true;
    }
  };

  return (
    <>
      <div
        className="w-full flex flex-col items-center bg-background-100 dark:bg-background-dark-300
          pl-3.5 pr-3.5 pt-6 pb-6 rounded-4xl"
      >
        <div className="flex flex-col w-full h-full pl-3.5 pr-3.5 pt-1 pb-1 overflow-y-auto">
          {error && (
            <div
              className="text-red-700 mb-2 text-sm rounded-md p-2 bg-red-100 selection:bg-red-50
                selection:rounded-md"
            >
              {error}
            </div>
          )}
          <div
            className="group border h-48 w-full pl-2.5 pr-2.5 pt-1.5 pb-1.5 shrink-0 resize-none
              transition-all duration-300 border-border-100 dark:border-none bg-background-100
              dark:bg-background-dark-100 rounded-3xl shadow-subtle outline-none
              focus-within:shadow-text-box"
          >
            <textarea
              onChange={handleInputChange}
              ref={translateInputRef}
              id="translate-input"
              placeholder="Type here..."
              dir="auto"
              maxLength={6000}
              className="h-full w-full pl-2.5 pr-2.5 pt-1.5 pb-1.5 overflow-y-auto resize-none
                outline-none text-primary-100 dark:text-primary-dark-100"
            />
          </div>
          <div className="flex mt-4 mb-4 pl-5 pr-5 items-end justify-between gap-8 w-full">
            <div className="flex gap-4">
              {/* placeholder for left side buttons */}
            </div>
            <div className="flex gap-8 items-end">
              <LanguageSelector
                onChange={setSourceLanguage}
                languages={languages}
                value={sourceLanguage}
                label={"Source language"}
                id="source-language-select"
              />
              <SwitchButton onClick={handleSwitch} />
              <LanguageSelector
                onChange={setTargetLanguage}
                languages={languages}
                value={targetLanguage}
                label={"Target language"}
                id="target-language-select"
              />
            </div>
            <div className="flex gap-4">
              <SaveButton
                ref={saveButtonRef}
                isSaved={isTranslationSaved}
                onClick={handleSave}
              />
            </div>
          </div>
          <div
            ref={translateOutputRef}
            id="translate-output"
            dir="auto"
            className="relative border flex-1 border-border-100 dark:border-none bg-background-200
              text-primary-200 dark:text-primary-dark-200 dark:bg-background-dark-200 w-full
              pl-5 pr-5 pt-3 pb-3 resize-none transition-all duration-300 rounded-3xl
              shadow-subtle whitespace-pre-line"
          >
            <div>
              {loading ? (
                <div className="text-secondary-300">Translating...</div>
              ) : (
                translatedText
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Translator;
