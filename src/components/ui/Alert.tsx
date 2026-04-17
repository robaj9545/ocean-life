import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  type?: AlertType;
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  alert: (options: AlertOptions) => void;
}

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────
const AlertContext = createContext<AlertContextType>({ alert: () => {} });

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({
    type: 'info',
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
  });

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const alert = useCallback((opts: AlertOptions) => {
    setOptions({ type: 'info', buttons: [{ text: 'OK' }], ...opts });
    setVisible(true);
    scaleAnim.setValue(0.85);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 18,
        stiffness: 220,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, scaleAnim]);

  const dismiss = (btn?: AlertButton) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.88,
        useNativeDriver: true,
        damping: 15,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      btn?.onPress?.();
    });
  };

  const config = configs[options.type ?? 'info'];
  const Icon = config.icon;
  const buttons = options.buttons ?? [{ text: 'OK' }];

  // Apenas 2 botões ficam lado a lado. 1 ou 3+ ficam em coluna.
  const isRow = buttons.length === 2;

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => dismiss()}
      >
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => dismiss()} />

          <Animated.View
            style={[
              styles.cardWrapper,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            <View style={styles.cardTop}>
              <View style={[styles.iconWrapper, { backgroundColor: config.iconBg }]}>
                <Icon size={28} color={config.iconColor} />
              </View>

              <Text style={styles.title}>{options.title}</Text>

              {!!options.message && (
                <Text style={styles.message}>{options.message}</Text>
              )}
            </View>

            <View style={styles.divider} />

            {isRow && (
              <View style={styles.buttonsRowContainer}>
                {buttons.map((btn, index) => {
                  const isDestructive = btn.style === 'destructive';
                  const isCancel = btn.style === 'cancel';
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && <View style={styles.dividerVertical} />}
                      <Pressable
                        style={({ pressed }) => [
                          styles.btnRow,
                          index === 0 && styles.btnBottomLeft,
                          index === buttons.length - 1 && styles.btnBottomRight,
                          pressed && styles.btnPressed,
                        ]}
                        onPress={() => dismiss(btn)}
                        android_ripple={{ color: '#f5f5f5' }}
                      >
                        <Text
                          style={[
                            styles.btnText,
                            isDestructive && styles.btnTextDestructive,
                            isCancel && styles.btnTextCancel,
                            !isDestructive && !isCancel && styles.btnTextDefault,
                          ]}
                        >
                          {btn.text}
                        </Text>
                      </Pressable>
                    </React.Fragment>
                  );
                })}
              </View>
            )}

            {!isRow && (
              <View style={styles.buttonsColumnContainer}>
                {buttons.map((btn, index) => {
                  const isDestructive = btn.style === 'destructive';
                  const isCancel = btn.style === 'cancel';
                  const isLast = index === buttons.length - 1;
                  return (
                    <React.Fragment key={index}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.btnColumn,
                          isLast && styles.btnLastInColumn,
                          pressed && styles.btnPressed,
                        ]}
                        onPress={() => dismiss(btn)}
                        android_ripple={{ color: '#f5f5f5' }}
                      >
                        <Text
                          style={[
                            styles.btnText,
                            isDestructive && styles.btnTextDestructive,
                            isCancel && styles.btnTextCancel,
                            !isDestructive && !isCancel && styles.btnTextDefault,
                          ]}
                        >
                          {btn.text}
                        </Text>
                      </Pressable>
                      {!isLast && <View style={styles.divider} />}
                    </React.Fragment>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}

// Configurado para dar look 'Ocean-life'
const configs: Record<AlertType, { icon: any; iconBg: string; iconColor: string }> = {
  success: {
    icon: CheckCircle,
    iconBg: 'rgba(5, 150, 105, 0.15)',
    iconColor: '#059669',
  },
  error: {
    icon: AlertCircle,
    iconBg: 'rgba(220, 38, 38, 0.15)',
    iconColor: '#dc2626',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'rgba(217, 119, 6, 0.15)',
    iconColor: '#d97706',
  },
  info: {
    icon: Info,
    iconBg: 'rgba(37, 99, 235, 0.15)',
    iconColor: '#3b82f6',
  },
};

const RADIUS = 20;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 13, 31, 0.65)', // Fundo estilo as profundezas do app
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0a1e3c', // Cor base do tema oceano do jogo
    borderRadius: RADIUS,
    shadowColor: '#00e5ff', // Glow style
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)'
  },
  cardTop: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    paddingBottom: 24,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 28,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 24,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonsRowContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
    overflow: 'hidden',
  },
  buttonsColumnContainer: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
    overflow: 'hidden',
  },
  btnRow: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnColumn: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  btnBottomLeft: {
    borderBottomLeftRadius: RADIUS,
  },
  btnBottomRight: {
    borderBottomRightRadius: RADIUS,
  },
  btnLastInColumn: {
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
  },
  btnText: {
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  btnTextDefault: {
    color: '#00E5FF',
  },
  btnTextCancel: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  btnTextDestructive: {
    color: '#fc8181',
  },
});
